package pbm.debugutil.deobf;

import java.io.File;
import java.util.Collections;
import java.util.Comparator;
import java.util.Hashtable;
import java.util.LinkedList;
import java.util.Vector;

import pbm.debugutil.LogReader;
import pbm.debugutil.SimpleReader;
import pbm.debugutil.UnexpectedFormatException;

public class DeobfuscateManager {

	private static final String CLASS_TAG = "CURRENT CLASS";
	private static final String OBFUSCATED_CLASS_TAG = "OBFUSCATED CLASS";
	private static final String OBFUSCATED_METHOD_TAG = "OBFUSCATED METHOD";
	private static final String PREVIOUSLY_OBFUSCATED_TAG = "PREVIOUSLY OBFUSCATED";
	private static final String SEPARATOR_TAG = "====";

	private String m_name = null;
	private Hashtable<String, ObfPackage> m_packages;
	private Vector<File> m_loadedLogs;
	
	// Keep a duplicate list of known packages, sorted in descending order of
	// length of package name.  Therefore, when searching for a matching package
	// name when deofuscating a string we start with the most specific.  This
	// should avoid us mistakenly matching the input string 'xxx a.b.c.d.e yyy' to
	// the package 'a.b.c' if there's also a package 'a.b.c.d'.
	private LinkedList<ObfPackage> m_orderedPackages;

	
	public DeobfuscateManager() {
		m_packages = new Hashtable<String, ObfPackage>();
		m_orderedPackages = new LinkedList<ObfPackage>();
		m_loadedLogs = new Vector<File>();
	}
	
	
	public void reset() {
		m_packages.clear();
		m_orderedPackages.clear();
		m_loadedLogs.clear();
		m_name = null;
	}
	
	
	public boolean isReady() {
		return (m_name != null);
	}
	
	
	public String getName() {
		return m_name;
	}
	
	
	public Vector<File> getLogs() {
		return m_loadedLogs;
	}
	
	
	public void loadJOBELog(File logfile) throws Exception {
		
		LogReader reader = new SimpleReader(logfile);
		
		String line = reader.getNextLine();
		if (!line.equals("JOBE VERSION 2.0"))
			System.out.println("Warning: not a JOBE 2.0 log - may cause unexpected results");
		
		while (line != null) {
			
			//Seek to start of next class entry
			while (line != null && !line.startsWith(CLASS_TAG)) line = reader.getNextLine();
			
			if (line != null) {
				
				ObfClass currClass;

				// Process class
				String packagename = null;
				String classname = null;
				String obfclassname = null;

				String tmp;
				int idx;

				tmp = line.substring(CLASS_TAG.length()).trim();
				idx = tmp.lastIndexOf('/');
				classname = tmp.substring(idx + 1);
				packagename = tmp.substring(0, idx);
				packagename = packagename.replace('/', '.');	
				
				
				line = reader.getNextLine();
				
				if (line.startsWith(OBFUSCATED_CLASS_TAG)) {
					tmp = line.substring(line.lastIndexOf('\t')).trim();
					idx = tmp.lastIndexOf('/');
					obfclassname = tmp.substring(idx + 1);
					
					// Sanity check - ensure package name from orig and obf class names match 
					tmp = tmp.substring(0, idx);
					tmp = tmp.replace('/', '.');
					if (!tmp.equals(packagename)) {
						throw new UnexpectedFormatException ("Package name mismatch, JOBE log, line " + reader.getLineNum() + 
								".\n  Package from orig class: " + packagename +
								"\n  Package from obf class: " + tmp);
					}
				} else {
					obfclassname = classname;
				}

				//System.out.println(classname + "\n -> " + obfclassname);

				currClass = new ObfClass(classname);

				// Process class methods
				line = reader.getNextLine();

				while (line != null && !line.startsWith(SEPARATOR_TAG)) {
					
					if (line.startsWith(OBFUSCATED_METHOD_TAG)) {
						idx = line.lastIndexOf('\t');
						String obfmethod = line.substring(idx + 1).trim();
						if (obfmethod.equals(PREVIOUSLY_OBFUSCATED_TAG)) {
							int endidx = idx;
							idx = line.lastIndexOf('\t', endidx - 1);
							obfmethod = line.substring(idx + 1, endidx).trim();
						}
//						String method = line.substring(line.indexOf('\t') + 1, idx + 1);  // Gets full method info, including params and return type
						String method = line.substring(line.indexOf('\t') + 1, line.indexOf('('));  // Gets only the method name
						
						//System.out.println("  " + method + " -> " + obfmethod);
						currClass.addMethod(obfmethod, method);
					}

					line = reader.getNextLine();
				}
				
				// Add class to package.
				// Note that originally the class was only added if it had obfuscated methods
				// (currClass.hasMethods()).  However, I discovered classes that were obfuscated
				// but had no obfuscated methods, e.g. TransactionMgr$TxThread.  Therefore, the
				// class is now always added.
				getPackage(packagename).addClass(obfclassname, currClass);
			
				
				line = reader.getCurrentLine();				
			}
			
		}
		
		// Set DeobfuscateManager name based on filename of JOBE log
		if (m_name == null) {
			m_name = logfile.getName();
		} else {
			m_name += ", " + logfile.getName();
		}
		
		m_loadedLogs.add(logfile);
		
		reader.close();
		
	}
	
	private ObfPackage getPackage(String packagename) {
		ObfPackage obfp = m_packages.get(packagename);
		if (obfp == null) {
			obfp = new ObfPackage(packagename);
			m_packages.put(packagename, obfp);
			//System.out.println("Added package " + packagename);
			
			m_orderedPackages.add(obfp);
			Collections.sort(m_orderedPackages, new PackageNameLengthComparator());
		}
		return obfp;
	}

	public String deobfuscateLine(String in) {

		int idx;
		
		// Search input line to see whether any of our known packages are present
		// This could be optimised by maintaining a separate collection of just
		// the first part of the package name (com., progress., etc...) and checking
		// that first.
		for (ObfPackage obfp : m_orderedPackages) {
			
			//System.out.println("Checking against " + obfp.getName());
			
			idx = in.indexOf(obfp.getName());
			
			if (idx >= 0) {
				
				// Found a match for package.  Continue with translation.
				String result;
				
				result = in.substring(0, idx);

				idx += obfp.getName().length();
				if (idx < in.length() && in.charAt(idx) == '.') {
					idx++;
					
					//System.out.println("    translating " + in);
					//System.out.println("         prefix " + result);
					//System.out.println("        package " + obfp.getName());
					//System.out.println("      remainder " + in.substring(idx));

					// Append package to result
					result += obfp.getName();
					
					// Handle class
					String classname = getNextObfElement(in.substring(idx));
					
					// If we don't find a matching class for deobfuscation, return
					// the original string 
					if (classname == null) return in;
                    ObfClass obfc = obfp.getClass(classname);
                    if (obfc == null) return in;
                    
					// Append (deobfuscated) class name to result
                    result += "." + obfc.getName();
                    
					// Move index along to end of classname
					idx += classname.length();
					
					if (idx < in.length() && in.charAt(idx) == '.') {
						//Handle method
						idx++;
						
						String methodname = getNextObfElement(in.substring(idx));
						
						if (methodname == null) return in;
	                    result += "." + obfc.translateMethod(methodname);						

						// Move index along to end of classname
						idx += methodname.length();
					}
					
					// Append whatever's left to the deobfuscated result
					if (idx < in.length()) {
						result += in.substring(idx);
					}
					
					return result;
					
				}
			}
		}
		
		// No match for package found - return original string
		return in;
		
	}
	
	// Search string to find next character that's not part of
	// a class or or method name, and return the portion of the
	// string up to that point.
	// '$' used to denote inner class, so treat that as part of
	// a valid classname.
	// ('$' already included by Character.isJavaIdentifierPart())
	private String getNextObfElement(String in) {
		
		if (in.length() == 0) return null;
		
		int idx = 0;
		char currChar = in.charAt(idx);
		
		while (Character.isJavaIdentifierPart(currChar)) {
			idx++;
			if (idx == in.length()) break;
			currChar = in.charAt(idx);
		}
		
		return in.substring(0, idx);
	}

	
	public class ObfPackage {

		private String m_name;
		private Hashtable<String, ObfClass> m_classes;
		
		public ObfPackage(String name) {
			m_name = name;
			m_classes = new Hashtable<String, ObfClass>();
		}
		
		public String getName() {
			return m_name;
		}

		public void addClass(String obfName, ObfClass obfclass) {
			
			if (m_classes.containsKey(obfName)) {
				System.err.println("Warning: package " + m_name + " already contains entry for " +
						obfName + ".  Existing entry will be lost.");
			}
			
			m_classes.put(obfName, obfclass);
			
		}

		// Returns null if matching class not found
		public ObfClass getClass(String obfName) {
			return m_classes.get(obfName);
		}		
		
	}
	
	
	public class ObfClass {

		private String m_name;
		private Hashtable<String, String> m_methods;
		
		public ObfClass(String name) {
			m_name = name;
			m_methods = new Hashtable<String, String>();
		}
		
		public String getName() {
			return m_name;
		}
		
		public void addMethod(String obfName, String realName) {
			m_methods.put(obfName, realName);
		}
		
		// Returns existing name if a match not found (assumes method is already unobfuscated)
		public String translateMethod(String obfName) {
			if (obfName == null) return null;
			
			String realName;
			realName = m_methods.get(obfName);
			return (realName == null) ? obfName : realName;
		}
		
		public boolean hasMethods() {
			return (m_methods.size() > 0);
		}
		
	}
	
	
	// Comparator for sorting packages into reverse order based on name length
	// (longest package names first)
	public class PackageNameLengthComparator implements Comparator<ObfPackage> {

		public int compare(ObfPackage o1, ObfPackage o2) {
			return ((Integer)(o2.getName().length())).compareTo(o1.getName().length());
		}

	}	
	

}
