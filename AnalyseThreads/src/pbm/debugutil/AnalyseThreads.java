package pbm.debugutil;

import java.io.File;
import java.io.PrintStream;
import java.util.LinkedList;
import java.util.List;
import java.util.Vector;

import pbm.debugutil.deobf.DeobfuscateManager;

public class AnalyseThreads {

	public static final String VERSION_STRING = "v0.63";

	public static boolean DEBUG = false;

	private Vector<ThreadDumpReader> m_readers = null;
	private List<ThreadDump> m_threadDumps = null;
	private String m_title = null;
	
	private DeobfuscateManager m_deobfuscator = null;
	
    public AnalyseThreads () {
		// Register thread dump readers.  These should be ordered so that
		// those with more specific testFormat() methods appear first
		m_readers = new Vector<ThreadDumpReader>();
		m_readers.add(new ThreadDumpReaderIBM());
        m_readers.add(new ThreadDumpReaderCustom2());
        m_readers.add(new ThreadDumpReaderYourKit());
		m_readers.add(new ThreadDumpReaderSun());
		m_readers.add(new ThreadDumpReaderSDF());
		m_readers.add(new ThreadDumpReaderSDF7x());
		m_readers.add(new ThreadDumpReaderJSW());
		m_readers.add(new ThreadDumpReaderCustom1());
		m_readers.add(new ThreadDumpReaderJDB());
        m_readers.add(new ThreadDumpReaderJStackF());
	}

	
/*
    // Analyses threads in thread dumps from Sun JVM console output (single file)

    public void doAnalyseFromLog(File logfile) {

		m_title = logfile.getName();
		
		ThreadDumpReader tdReader = new ThreadDumpReaderSun();
		m_threadDumps = tdReader.readThreadDumps(logfile);
    	
    }
*/
    
	
    // Analyses threads in thread dumps from a series of thread dump files
	// The thread dump format is determined automatically
    public void doAnalyseFromLogs(File [] logfiles) throws AnalyseThreadsException {
		doAnalyseFromLogs(logfiles, null);
    }

		
    // Analyses threads in thread dumps from a series of thread dump files
    // The name of the thread dump reader to be used may be specified.  If
	// readerName is null the thread dump format / reader is determined
	// automatically
    public void doAnalyseFromLogs(File [] logfiles, String readerName) throws AnalyseThreadsException {

		if (logfiles.length < 1) {
			System.err.println("ERROR: No log files provided!");
			throw new AnalyseThreadsException("No log files provided!");
		}
		
		LogReader [] logReaders = new LogReader[logfiles.length];
		
		try {
			for (int i = 0; i < logfiles.length; i++) {
				logReaders[i] = new SimpleReader(logfiles[i]);
			}
			
			doAnalyseImpl(logReaders, readerName);
		} finally {
			for (LogReader logReader : logReaders) {
				if (logReader != null) logReader.close();
			}
		}
   }
    
    // Analyses thread dumps read from a String.  A name for identifying
    // the dump must be provided.
    // The name of the thread dump reader to be used may also be specified.  If
	// readerName is null the thread dump format / reader is determined
	// automatically
    public void doAnalyseFromString(String dump, String dumpName, String readerName) throws AnalyseThreadsException {

    	if (dump == null)
			throw new AnalyseThreadsException("dump is null!");

		if (dumpName == null)
			throw new AnalyseThreadsException("dumpName is null!");
    
		LogReader [] logReaders = new LogReader[1];
		
		try {
			logReaders[0] = new SimpleReader(dump, dumpName);
			doAnalyseImpl(logReaders, readerName);
		} finally {
			for (LogReader logReader : logReaders) {
				if (logReader != null) logReader.close();
			}
		}
    }    

    private void doAnalyseImpl(LogReader [] logfiles, String readerName) throws AnalyseThreadsException {

		if (logfiles.length < 1) {
			throw new AnalyseThreadsException("No readers!");
		}
		
		if (m_threadDumps == null )
			m_threadDumps = new LinkedList<ThreadDump>();
		
		ThreadDumpReader tdReader = null;
		
		if (readerName == null || readerName.length() == 0) {
			
			// Use first log file to determine format
			for (ThreadDumpReader r : m_readers) {
				if (r.testFormat(logfiles[0])) {
					tdReader = r;
					break;
				}
			}
			
			if (tdReader == null) {
				System.err.println("Log format not recognised.");
				System.err.println("To force use of a specific thread dump reader, use the '-format' option.");
/*
				System.err.println("Available formats/readers:");
				for (ThreadDumpReader r : m_readers) {
					System.err.println("  " + r.getShortName() + " - "+ r.getName());
				}
*/ 
				displayAvailableFormats(System.err);
				throw new AnalyseThreadsException("Log format not recognised");				
			}			
			
		} else {
			
			for (ThreadDumpReader r : m_readers) {
				if (r.getShortName().equals(readerName)) tdReader = r;
			}
			
			if (tdReader == null) {
				System.err.println("ERROR: Thread dump reader '" + readerName + "' not found");
/*
				System.err.println("Available readers:");
				for (ThreadDumpReader r : m_readers) {
					System.err.println("  " + r.getShortName() + " - "+ r.getName());
				}
*/
				displayAvailableFormats(System.err);				
				throw new AnalyseThreadsException("Thread dump reader '" + readerName + "' not found");
			}
			
		}

		System.out.println("Using " + tdReader.getName() + " to parse log(s)");

		for (LogReader logfile : logfiles) {

			System.out.println("Parsing log: " + logfile.getPath());
			List<ThreadDump> newThreadDumps = tdReader.readThreadDumps(logfile);
			if (newThreadDumps != null) m_threadDumps.addAll(newThreadDumps);
			
			if (m_title == null) 
				m_title = logfile.getName();
			else
				m_title += ", " + logfile.getName();
			
		}
    	
    }
    
/*	
    // Analyses threads in thread dumps from JDB thread dumps - each dump in a separate file
    public void doAnalyseFromJDBStacks(File [] jdbfiles) {

    	m_threadDumps = new LinkedList<ThreadDump>();

		ThreadDumpReader tdReader = new ThreadDumpReaderJDB();
		
   		for (File logfile : jdbfiles) {

			List<ThreadDump> newThreadDumps = tdReader.readThreadDumpsFromLog(logfile);
			if (newThreadDumps != null) m_threadDumps.addAll(newThreadDumps);
			
			if (m_title == null) 
				m_title = logfile.getName();
			else
				m_title += ", " + logfile.getName();
			
		}   		
    	
    }
*/    
    
    public void processDumps() {
    	
		for (ThreadDump td : m_threadDumps) {
			td.computeMatches();
		}
    	
    }
    
    public void displaySummary(PrintStream outstream) {
    	
    	outstream.println("Analyse Threads summary - " + getTitle());
    	
    	outstream.println("\nNumber of thread dumps found: " + m_threadDumps.size());
		int i = 0;
		for (ThreadDump td : m_threadDumps) {
			outstream.println("Thread dump " + (++i) + " has " + td.getThreadCount() + " threads");
		}
		
		i = 0;
		for (ThreadDump td : m_threadDumps) {
			i++;
			outstream.println("\n=======================================================================");
			outstream.println("=======================================================================");
			outstream.println("\nMatches for thread dump " + i);
			outstream.println("\nSummary (thread dump " + i + ")...");
			td.displayMatchesSummary(outstream);
			outstream.println("\nDetail (thread dump " + i + ")...");
			td.displayMatchesDetail(outstream);
		}  
		
    }
    
    public int getNumDumps() {
    	return (m_threadDumps == null) ? 0 : m_threadDumps.size();
    }
    
    public List<ThreadDump> getThreadDumps() {
    	return m_threadDumps;
    }


    public String getTitle() {
		return m_title;
	}   
	
	
	public void loadDeobfuscationInfo(File jobelog) {
		
		if (m_deobfuscator == null) m_deobfuscator = new DeobfuscateManager();
		
		try {
			m_deobfuscator.loadJOBELog(jobelog);
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		processDeobfuscation();	
	}

	public void clearDeobfuscationInfo() {
		
		if (m_deobfuscator != null) m_deobfuscator.reset();
		processDeobfuscation();		
	}
	
	public void processDeobfuscation() {
		for (ThreadDump td : m_threadDumps) {
			td.processDeobfuscation(m_deobfuscator);
		}		
	}
	
	/*
	public void loadKnownThreadsInfo(File knownThreadsFile) throws AnalyseThreadsException {
		if (m_knownThreadsMgr == null) m_knownThreadsMgr = new KnownThreadsManager();
		try {
			m_knownThreadsMgr.load(knownThreadsFile);
		} catch (IOException ioe) {
			throw new AnalyseThreadsException("IOException from reading " + knownThreadsFile.getAbsolutePath() + ": " + ioe.getMessage(), ioe);
		} catch (UnexpectedFormatException ufe) {
			throw new AnalyseThreadsException("Unexpected format error while reading " + knownThreadsFile.getAbsolutePath() + ": " + ufe.getMessage(), ufe);
		} finally {
			m_knownThreadsMgr = null;
		}
	}

	public void saveKnownThreadsInfo(File knownThreadsFile) throws AnalyseThreadsException{
		if (m_knownThreadsMgr == null)
			throw new AnalyseThreadsException("No 'known threads' info to save!");
		
		try {
			m_knownThreadsMgr.save(knownThreadsFile);
		} catch (IOException ioe) {
			throw new AnalyseThreadsException("IOException when writing " + knownThreadsFile.getAbsolutePath() + ": " + ioe.getMessage(), ioe);
		}
	}
	
	public boolean hasKnownThreadsInfo() {	
		return (m_knownThreadsMgr != null);
	}
	*/
	
	public void processKnownThreads(KnownThreadsManager knownThreadsMgr) {
		for (ThreadDump td : m_threadDumps) {
			td.updateKnownThreadInfo(knownThreadsMgr);
		}		
	}	
	
	
	public static void main(String[] args) throws Exception {
		if (args.length != 1) {
			printUsage();
			System.exit(1);
		}
		
		String logfilename = args[0];
		
		File logfile = new File(logfilename);
		if (!logfile.canRead()) {
			System.err.println("File " + logfilename + " not found, or not readable");
			System.exit(1);
		}
		
		System.out.println("Analysing threads in log " + logfilename);

		AnalyseThreads analyser = new AnalyseThreads();
		analyser.doAnalyseFromLogs(new File[] {logfile});
		analyser.processDumps();
		analyser.displaySummary(System.out);
		
		System.out.println("Finished");
	}

	private static void printUsage() {
		System.err.println();
		System.err.println("Analyse Threads (Console), " + AnalyseThreads.VERSION_STRING);
		System.err.println();
		System.err.println("Usage: java AnalyseThreads <logfile>");
		System.err.println();
		AnalyseThreads.displayAvailableFormats(System.err);		
	}
	
	public static void displayAvailableFormats(PrintStream out) {
		AnalyseThreads tempAnalyser = new AnalyseThreads();
		out.println("Available formats/readers:");
		for (ThreadDumpReader r : tempAnalyser.m_readers) {
			out.println("  " + r.getShortName() + " - "+ r.getName());
		}		
	}

}
