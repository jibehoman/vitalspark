package pbm.debugutil;

import java.io.BufferedReader;
import java.io.EOFException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Vector;

public class Util {
	
	public static final int LOG_FORMAT_SUN_CONSOLE = 10;
	public static final int LOG_FORMAT_IBM_JAVACORE = 20;
	public static final int LOG_FORMAT_JDB = 100;
	
	private static final String THREAD_NAMES_RESOURCE = "threadnames.list";
	private static Vector<String> known_base_thread_names = null; 

	
	public static String computeThreadGroupName(String threadname) {

		String result;
		
		// See if thread name starts with a known prefix.  If so, return this
		// prefix.
		result = getKnownThreadName(threadname);
		if (result != null) return result;
		
		// Thread name not in known prefix list, so let's try guessing at a
		// group name: look for a digit and truncate the thread name there
		// (as long as the first character isn't a digit)
		result = threadname;

		int digitIdx = -1;
		for (int i = 0; i < result.length(); i++) {
			if (Character.isDigit(result.charAt(i))) {
				digitIdx = i;
				break;
			}
		}

		if (digitIdx > 0)
			result = result.substring(0, digitIdx) + "*";
		
		return result;
	}	
	
	
	public static String getKnownThreadName(String threadname) {
		
		if (known_base_thread_names == null) buildKnownThreadNamesList();

		for (String comparename : known_base_thread_names) {
			if (threadname.startsWith(comparename)) return comparename;
		}
		
		return null;
	}

	
	private static void buildKnownThreadNamesList() {
		
		known_base_thread_names = new Vector<String>();
		
		InputStream is = ClassLoader.getSystemResourceAsStream(THREAD_NAMES_RESOURCE);
		BufferedReader reader = new BufferedReader(new InputStreamReader(is));
		
		String currentLine = null;
		
		try {
			while ((currentLine = reader.readLine()) != null) {
				currentLine = currentLine.trim();
				if (currentLine != null && currentLine.length() > 0 && !currentLine.startsWith("#")) {
					
					// Thread name can be surrounded in quotes if trailing white-space is important
					if (currentLine.startsWith("\"") && currentLine.endsWith("\""))
						currentLine = currentLine.substring(1, currentLine.length() - 1);
				
					known_base_thread_names.add(currentLine);
					
				}
			}
		} catch (EOFException eof) {
			// expected
		} catch (IOException e) {
			System.err.println("Exception while reading thread names from " + THREAD_NAMES_RESOURCE + ":");
			e.printStackTrace();
		}
		
		try {
			reader.close();
		} catch (IOException e) {
			System.err.println("Exception while closing " + THREAD_NAMES_RESOURCE);
			e.printStackTrace();
		}

		// Debug
		//printKnownThreadNames();		
		
	}
	
	
	// Returns a truncated version of the string (for use in error messages)
	// no longer than maxChars.
	// If the string needs truncating then '...' is appended, ensuring the result
	// (including the '...') is no longer than maxChars.
	public static String truncateString(String str, int maxChars) {
		if (str.length() >= maxChars)
			return str;
		else
			return str.substring(0, maxChars - 3) + "...";
	}

	
	// For debug purposes...
	public static void printKnownThreadNames() {
		
		if (known_base_thread_names == null) buildKnownThreadNamesList();

		System.out.println("List of recognised thread name prefixes:");

		for (String threadname : known_base_thread_names) {
			System.out.println("  \"" + threadname + "\"");
		}
		
	}

}
