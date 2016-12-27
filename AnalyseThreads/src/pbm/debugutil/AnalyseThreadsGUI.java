package pbm.debugutil;

import java.awt.Component;
import java.awt.Cursor;
import java.awt.Toolkit;
import java.awt.datatransfer.Clipboard;
import java.awt.datatransfer.ClipboardOwner;
import java.awt.datatransfer.DataFlavor;
import java.awt.datatransfer.StringSelection;
import java.awt.datatransfer.Transferable;
import java.awt.event.MouseAdapter;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;
import java.io.File;
import java.io.PrintStream;
import java.text.SimpleDateFormat;
import java.util.Date;

import javax.swing.JFileChooser;
import javax.swing.JOptionPane;

import pbm.debugutil.gui.ATMainFrame;
import pbm.debugutil.gui.PreferenceManager;

public class AnalyseThreadsGUI implements ClipboardOwner {

	private AnalyseThreads m_analyser;
	private ATMainFrame m_frame;
	private String m_readerName = null;
	
	private KnownThreadsManager m_knownThreadsMgr = null;
	private boolean m_sortThreadGroupsByFilter = false;
	
	public enum ThreadExpectedState { NO_THREAD, UNRECOGNISED, EXPECTED };

	// Properties with PropertyChangeSupport
	private boolean m_hasThreadDumps = false;
	private boolean m_hasExpectedThreads = false;
	private ThreadDump m_selectedThreadDump = null;	
	private MatchedThreadGroup m_selectedThreadGroup = null;
	private String m_selectedThreadId = null;
	private ThreadExpectedState m_selectedThreadIsExpected = ThreadExpectedState.NO_THREAD;
	private String m_searchString = null;
	
	private final PropertyChangeSupport propChangeSupport = new PropertyChangeSupport(this);
	public static final String HAS_THREAD_DUMPS_PROPERTY= "HasThreadDumps";
	public static final String HAS_EXPECTED_THREADS_PROPERTY= "HasExpectedThreads";
    public static final String SEARCH_STRING_PROPERTY= "SearchString";
	public static final String SELECTED_THREAD_DUMP_PROPERTY= "SelectedThreadDump";
	public static final String SELECTED_THREAD_GROUP_PROPERTY= "SelectedThreadGroup";
	public static final String SELECTED_THREAD_ID_PROPERTY= "SelectedThreadId";
	public static final String SELECTED_THREAD_IS_EXPECTED_PROPERTY= "SelectedThreadIsExpected";
	
	// Singleton reference to this class
	private static AnalyseThreadsGUI s_analyseThreadsApp = null;

    private static final Cursor DEFAULT_CURSOR = Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR);
    private static final Cursor WAIT_CURSOR = Cursor.getPredefinedCursor(Cursor.WAIT_CURSOR);
    private static final MouseAdapter nullMouseAdapter = new MouseAdapter() {};
	
	// Java Preferences paths
	public static final String PREFS_ANALYSE_THREADS = "AnalyseThreads";
	private static final String PREF_THREAD_DUMPS_PATH = "ThreadDumpsDir";
	private static final String PREF_EXPECTED_THREADS_PATH = "ExpectedThreadsDir";
	private static final String PREF_EXPECTED_THREADS_FILE = "ExpectedThreadsFile";
	private static final String PREF_OBFUSCATION_LOGS_PATH = "ObfuscationLogsDir";

	// Time formatting for dump names
    private static final SimpleDateFormat CLIPBOARD_TIME_FORMAT = new SimpleDateFormat("HH:mm:ss");
//    private static SimpleDateFormat s_clipboardTimeFormat = new SimpleDateFormat(CLIPBOARD_TIME_FORMAT);;

	
	public AnalyseThreadsGUI() {

		m_knownThreadsMgr = new KnownThreadsManager();
		s_analyseThreadsApp = this;

		/*
		try {
	        UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
	    } catch (Exception e) {
	    	// Don't worry if we can't get the L&F we want
	    }
	    */
				
		m_frame = new ATMainFrame(this);
		
        m_frame.addWindowListener(new WindowAdapter() {
            public void windowClosing(WindowEvent e) { exit(); }});

        m_frame.setVisible(true);
		        
	}
	
	public static AnalyseThreadsGUI getInstance() {
		return s_analyseThreadsApp;
	}
	
	public AnalyseThreads getAnalyser() {
		return m_analyser;
	}
	
	public ATMainFrame getMainFrame() {
		return m_frame;
	}
	
/*	
	public boolean hasExpectedThreads() {
		return m_knownThreadsMgr.getCount() > 0;
	}	
*/

	public ThreadDump getSelectedThreadDump() {
		return m_selectedThreadDump;
	}

	public void setSelectedThreadDump(ThreadDump threadDump) {
		ThreadDump oldThreadDump = m_selectedThreadDump;
		m_selectedThreadDump = threadDump;
        propChangeSupport.firePropertyChange(SELECTED_THREAD_DUMP_PROPERTY, oldThreadDump, m_selectedThreadDump);		
	}
	
	public String getSelectedThreadId() {
		return m_selectedThreadId;
	}

	public void setSelectedThreadId(String threadId) {
		String oldThreadId = m_selectedThreadId;
		m_selectedThreadId = threadId;
        propChangeSupport.firePropertyChange(SELECTED_THREAD_ID_PROPERTY, oldThreadId, m_selectedThreadId);		
	}	
	
	public boolean getHasThreadDumps() {
		return m_hasThreadDumps;
	}
	
	public void setHasThreadDumps(boolean hasThreadDumps) {
		boolean old = m_hasThreadDumps;
		m_hasThreadDumps = hasThreadDumps;
        propChangeSupport.firePropertyChange(HAS_THREAD_DUMPS_PROPERTY, old, m_hasThreadDumps);
		
		if (hasThreadDumps == false)
			setSelectedThreadGroup(null);
	}
			
	public boolean getHasExpectedThreads() {
		boolean checkValue = m_knownThreadsMgr.getCount() > 0;
		if (m_hasExpectedThreads != checkValue) {
			System.err.println("!!ASSERTION FAILURE!!: AnalyseThreadsGUI.getHasExpectedThreads() - m_hasExpectedThreads != checkValue");
			setHasExpectedThreads(checkValue);
		}
		
		return m_hasExpectedThreads;
	}

	public void setHasExpectedThreads(boolean hasExpectedThreads) {
		boolean old = m_hasExpectedThreads;
		m_hasExpectedThreads = hasExpectedThreads;
        propChangeSupport.firePropertyChange(HAS_EXPECTED_THREADS_PROPERTY, old, m_hasExpectedThreads);		
	}	
	
	public MatchedThreadGroup getSelectedThreadGroup() {		
		return m_selectedThreadGroup;
	}
	
	public void setSelectedThreadGroup(MatchedThreadGroup threadGroup) {
		MatchedThreadGroup oldThreadGroup = m_selectedThreadGroup;
		m_selectedThreadGroup = threadGroup;
        propChangeSupport.firePropertyChange(SELECTED_THREAD_GROUP_PROPERTY, oldThreadGroup, m_selectedThreadGroup);
		if (threadGroup == null)
			setSelectedThreadIsExpected(ThreadExpectedState.NO_THREAD);
		else
			setSelectedThreadIsExpected(m_selectedThreadGroup.isGoodThread() ? ThreadExpectedState.EXPECTED : ThreadExpectedState.UNRECOGNISED);
	}
	
	// Call to update both the thread group and thread dump info.  We should ensure
	// these are in sync, so preferable to set them together
	public void setSelectedThreadGroup(MatchedThreadGroup threadGroup, ThreadDump threadDump) {
		setSelectedThreadDump(threadDump);
		setSelectedThreadGroup(threadGroup);
	}	
	
	public ThreadExpectedState getSelectedThreadIsExpected() {
		return m_selectedThreadIsExpected;
	}
	
	public void setSelectedThreadIsExpected(ThreadExpectedState threadIsExpected) {
		ThreadExpectedState old = m_selectedThreadIsExpected;
		m_selectedThreadIsExpected = threadIsExpected;
        propChangeSupport.firePropertyChange(SELECTED_THREAD_IS_EXPECTED_PROPERTY, old, m_selectedThreadIsExpected);
	}
	
    public String getSearchString() {
        return m_searchString;
    }
    
    public void setSearchString(String searchString) {
        String old = m_searchString;
        m_searchString = searchString;
        propChangeSupport.firePropertyChange(SEARCH_STRING_PROPERTY, old, m_searchString);
    }   	
	
	
	private void setReaderName(String readerName) {
		m_readerName = readerName;
		System.out.println("Forcing use of thread dump reader '" + m_readerName + "'");
	}
	
	public void openDumps() {
        setWaitCursor(true);
        try {
            JFileChooser chooser = new JFileChooser();
            chooser.setMultiSelectionEnabled(true);
            chooser.setDialogTitle("Open Log(s)");

            // Set start directory based on user prefs
            String startDirName = PreferenceManager.getInstance().getString(PREFS_ANALYSE_THREADS, PREF_THREAD_DUMPS_PATH, null);
            File startDir = startDirName != null ? new File(startDirName) : null;
            if (startDir != null && startDir.isDirectory() && startDir.canExecute()) {
                chooser.setCurrentDirectory(startDir);
            } else {
                chooser.setCurrentDirectory(new File(System.getProperty("user.dir")));
            }	
		
            int option = chooser.showOpenDialog(m_frame);

            if (option == JFileChooser.APPROVE_OPTION)
                openDumps(chooser.getSelectedFiles());
        } finally {
            setWaitCursor(false);
        }
	}
	
	public void openDumps(File [] logfiles) {
		
		if (logfiles == null || logfiles.length < 1) {
			System.out.println("AnalyseThreadsGUI.openDumps() called, but no files selected!");
			return;
		}
		
		System.out.println("Read thread dumps from:");
		for (File f : logfiles)
			System.out.println("  " + f.getAbsolutePath());

		// Update user prefs with current directory if different
		String origDirName = PreferenceManager.getInstance().getString(PREFS_ANALYSE_THREADS, PREF_THREAD_DUMPS_PATH, null);
		String newDirName = logfiles[0].getParentFile().getPath();
		if (!newDirName.equals(origDirName)) {
			PreferenceManager.getInstance().setString(PREFS_ANALYSE_THREADS, PREF_THREAD_DUMPS_PATH, newDirName, true);
		}		

		setWaitCursor(true);
		try {
			m_analyser = new AnalyseThreads();
			m_analyser.doAnalyseFromLogs(logfiles, m_readerName);
			m_analyser.processDumps();
			setHasThreadDumps(true);
			if (getHasExpectedThreads()) {
				m_analyser.processKnownThreads(m_knownThreadsMgr);
			}
			System.out.println("\nRendering in GUI...\n");
			m_frame.showAnalysis();				
		} catch (Exception e) {
			System.err.println("Error analysing thread dumps...");
			e.printStackTrace();
			m_analyser = null;
			setHasThreadDumps(false);
			JOptionPane.showMessageDialog(m_frame, "Error analysing thread dumps (see console for more info): \n" + e, "Error", JOptionPane.ERROR_MESSAGE);
			m_frame.showEmpty();							
		}
		setWaitCursor(false);
		
	}
	
	public void openDumpFromClipboard() {

	    Clipboard clipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
	    Transferable contents = clipboard.getContents(null);

	    String stringContent = null;
	    
	    try {
	    	stringContent = (String)contents.getTransferData(DataFlavor.stringFlavor);
	    } catch (Exception e) {
			System.err.println("Unable to read thread dump from clipboard:" + e);
	        e.printStackTrace();
	        return;
	    }

	    // Build name for this dump (or set of dumps) - displayed in top-level title bar
	    //if (clipboardTimeFormat == null) clipboardTimeFormat = new SimpleDateFormat(CLIPBOARD_TIME_FORMAT);
	    String clipboardName = "Clipboard" + "-" + CLIPBOARD_TIME_FORMAT.format(new Date());
	    
	    
	    if (m_analyser != null) {
			String msg = "Clear existing thread dumps first?";
			int result = JOptionPane.showConfirmDialog(m_frame, msg, "Reading dump(s) from Clipboard...", JOptionPane.YES_NO_CANCEL_OPTION, JOptionPane.QUESTION_MESSAGE);
			if (result == JOptionPane.YES_OPTION)
				m_analyser = new AnalyseThreads();
			else if (result == JOptionPane.CANCEL_OPTION)
				return ;
	    } else {
	    	m_analyser = new AnalyseThreads();
	    }
	    
		setWaitCursor(true);
		try {
			m_analyser.doAnalyseFromString(stringContent, clipboardName, m_readerName);
			m_analyser.processDumps();
			setHasThreadDumps(true);
			if (getHasExpectedThreads()) {
				m_analyser.processKnownThreads(m_knownThreadsMgr);
			}
			System.out.println("\nRendering in GUI...\n");
			m_frame.showAnalysis();				
		} catch (Exception e) {
			System.err.println("Error analysing thread dumps...");
			e.printStackTrace();
			JOptionPane.showMessageDialog(m_frame, "Error analysing thread dumps (see console for more info): \n" + e, "Error", JOptionPane.ERROR_MESSAGE);
			if (m_analyser.getNumDumps() < 1) {
				m_analyser = null;
				setHasThreadDumps(false);
				m_frame.showEmpty();							
			}
		} finally {
		    setWaitCursor(false);
		}
		
	}
	
	public void copyDumpToClipboard() {
	    
	    // No-op if no thread dumps selected
	    if (getSelectedThreadDump() == null) return;
	    
        setWaitCursor(true);
        try {
            // Build text for clipboard
            StringBuffer text = new StringBuffer();
            text.append(getMainFrame().getDisplayInfo(getSelectedThreadDump()).getName());
            text.append("\n\n");
            for (RawThread rt : getSelectedThreadDump().getRawThreads()) {
                text.append(rt.getTitle());
                for (String s : rt.getDeobfuscatedStack()) {
                    text.append("\n    " + s);
                }
                text.append("\n\n");
            }
            
            // Put on clipboard
            StringSelection stringSelection = new StringSelection(text.toString());
            Clipboard clipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
            clipboard.setContents(stringSelection, this);
        } finally {        
            setWaitCursor(false);
        }
	}
	
	/**
	 * Empty implementation of the ClipboardOwner interface.
	 */
	public void lostOwnership(Clipboard clipboard, Transferable contents) {
	    //do nothing
	}
	

	
	public void saveSummary() {
	
		JFileChooser chooser = new JFileChooser();
		chooser.setDialogTitle("Save Summary");		
		
		// Set start directory based on user prefs
		String startDirName = PreferenceManager.getInstance().getString(PREFS_ANALYSE_THREADS, PREF_THREAD_DUMPS_PATH, null);
		File startDir = startDirName != null ? new File(startDirName) : null;
		if (startDir != null && startDir.isDirectory() && startDir.canExecute()) {
			chooser.setCurrentDirectory(startDir);
		}
		
		int option = chooser.showSaveDialog(m_frame);
		if (option == JFileChooser.APPROVE_OPTION) {
			java.io.File outputFile = chooser.getSelectedFile();

			if (outputFile != null) {
			
				if (outputFile.exists()) {
					String msg = "File " + outputFile + " already exists. Overwrite?";
					int result = JOptionPane.showConfirmDialog(m_frame, msg, "File exists", JOptionPane.YES_NO_OPTION, JOptionPane.QUESTION_MESSAGE);
					if (result != JOptionPane.YES_OPTION) return;
				}
			
				saveSummary(outputFile);
			}
		} 	
	}

	public void saveSummary(File outputFile) {
		System.out.println("Save summary to: " + outputFile);
		
		setWaitCursor(true);
		
		try {
			PrintStream ps = new PrintStream(outputFile);
			if (m_analyser != null)
				m_analyser.displaySummary(ps);
			ps.close();
		} catch (Exception e) {
			e.printStackTrace();
			JOptionPane.showMessageDialog(m_frame, "Error writing summary: \n" + e, "Error", JOptionPane.ERROR_MESSAGE);
		}
		setWaitCursor(false);
	}
	

	public void loadDeobfuscationInfo() {
		
		if (m_analyser == null) {
			JOptionPane.showMessageDialog(m_frame, "Please load thread dump(s) first", "Error", JOptionPane.ERROR_MESSAGE);
			return;
		}
		
		JFileChooser chooser = new JFileChooser();
		chooser.setDialogTitle("Open JOBE Log");
		
		// Set start directory based on user prefs
		String startDirName = PreferenceManager.getInstance().getString(PREFS_ANALYSE_THREADS, PREF_OBFUSCATION_LOGS_PATH, null);
		File startDir = startDirName != null ? new File(startDirName) : null;
		if (startDir != null && startDir.isDirectory() && startDir.canExecute()) {
			chooser.setCurrentDirectory(startDir);
		}
		
		int option = chooser.showOpenDialog(m_frame);
		
		if (option == JFileChooser.APPROVE_OPTION)
			loadDeobfuscationInfo(chooser.getSelectedFile());
	}
	
	public void loadDeobfuscationInfo(File jobelog) {
		System.out.println("Loading deobfuscation info from " + jobelog);
		if (jobelog == null) return;
		
		// Update user prefs with current directory if different
		String origDirName = PreferenceManager.getInstance().getString(PREFS_ANALYSE_THREADS, PREF_OBFUSCATION_LOGS_PATH, null);
		String newDirName = jobelog.getParentFile().getPath();
		if (!newDirName.equals(origDirName)) {
			PreferenceManager.getInstance().setString(PREFS_ANALYSE_THREADS, PREF_OBFUSCATION_LOGS_PATH, newDirName, true);
		}
		
		setWaitCursor(true);
		try {
		    m_analyser.loadDeobfuscationInfo(jobelog);
		
		    // Reprocess expected threads info' when obfuscation changes 
		    if (m_hasExpectedThreads)
		        m_analyser.processKnownThreads(m_knownThreadsMgr);
		
		    m_frame.refresh();
		} finally {
		    setWaitCursor(false);
		}
	}
	
	public void clearDeobfuscationInfo() {

		// If no thread dumps are loaded then there can't be any deobfuscation info'
		// loaded, so this is a no-op		
		if (m_analyser == null) {
			return;
		}		
		
		setWaitCursor(true);
		try {
		    m_analyser.clearDeobfuscationInfo();
		
		    // Reprocess expected threads info' when obfuscation changes 
		    if (m_hasExpectedThreads)
		        m_analyser.processKnownThreads(m_knownThreadsMgr);
		
		    m_frame.refresh();
		} finally {
		    setWaitCursor(false);
		}
	}
	
	
	public boolean getSortThreadGroupsByFilter() {
		return m_sortThreadGroupsByFilter;
	}		
	
		
	// Displays any exceptions.  Return value indicates success/failure
/*	public boolean setSortThreadGroupsByFilter(boolean sortByFilter) {
		// If filter is being enabled and no 'expected threads' info' is available
		// give the option of loading an expected threads file
		if (sortByFilter == true && !getHasExpectedThreads()) {
			String msg = "No information about expected threads is currently available.\n" +
			    "Would you like to load expected threads info now?";
			int result = JOptionPane.showConfirmDialog(m_frame, msg, "No expected threads info available", JOptionPane.YES_NO_OPTION, JOptionPane.QUESTION_MESSAGE);
			if (result == JOptionPane.YES_OPTION) loadExpectedThreads();			
		}
		
		setWaitCursor(true);
		m_sortThreadGroupsByFilter = sortByFilter;

		// Need to refresh screen (at least the MatchedThreadsPane)
		// Also results in call to setSelectedThreadGroup() which updates
		// menu items etc. in line with new known thread info'
		if (m_hasThreadDumps) m_frame.refresh();
		
		setWaitCursor(false);
		return true;
	}*/
	
	// Displays file chooser, then loads/processes expected threads from the selected file
	public void loadExpectedThreads() {
	
        setWaitCursor(true);
	    
	    try {
	        // Check whether user wants to clear existing known threads info first
	        if (getHasExpectedThreads()) {
	            String msg = "Clear existing expected threads info' first?";
	            int result = JOptionPane.showConfirmDialog(m_frame, msg, "Clear current info?", JOptionPane.YES_NO_CANCEL_OPTION, JOptionPane.QUESTION_MESSAGE);
	            if (result == JOptionPane.YES_OPTION) m_knownThreadsMgr.clear();
	            else if (result == JOptionPane.CANCEL_OPTION) return ;
	        }		
		
		
	        // Prompt for file to load expected threads info from
	        JFileChooser chooser = new JFileChooser();
	        chooser.setDialogTitle("Load Expected Threads Info");
		
	        // Set start directory based on user prefs
	        String startDirName = PreferenceManager.getInstance().getString(PREFS_ANALYSE_THREADS, PREF_EXPECTED_THREADS_PATH, null);
	        File startDir = startDirName != null ? new File(startDirName) : null;
	        if (startDir != null && startDir.isDirectory() && startDir.canExecute()) {
	            chooser.setCurrentDirectory(startDir);
	        }
		
	        int option = chooser.showOpenDialog(m_frame);
	        if (option == JFileChooser.APPROVE_OPTION)
	            loadExpectedThreads(chooser.getSelectedFile());
	    } finally {
	        setWaitCursor(false);
	    }
	}
	
	// Loads/processes expected threads from the given file	
	public void loadExpectedThreads(File expectedThreadsFile) {
		
		System.out.println("Loading expected threads info from " + expectedThreadsFile);
		if (expectedThreadsFile == null) return;		
		
		// Update user prefs with current directory if different
		/* Orig version - only update pref's if they've changed - maybe the Java pref's implementation already does this??
		String origDirName = PreferenceManager.getInstance().getString(PREFS_ANALYSE_THREADS, PREF_EXPECTED_THREADS_PATH, null);
		String newDirName = expectedThreadsFile.getParentFile().getPath();
		if (!newDirName.equals(origDirName)) {
			PreferenceManager.getInstance().setString(PREFS_ANALYSE_THREADS, PREF_EXPECTED_THREADS_PATH, newDirName, true);
		}
		
		String origFilename = PreferenceManager.getInstance().getString(PREFS_ANALYSE_THREADS, PREF_EXPECTED_THREADS_FILE, null);
		String newFilename = expectedThreadsFile.getPath();
		if (!newFilename.equals(origFilename)) {
			PreferenceManager.getInstance().setString(PREFS_ANALYSE_THREADS, PREF_EXPECTED_THREADS_FILE, newFilename, true);
		}
		*/
		// Keep it simple for now.  Always update prefs, though only flush changes on last update.
		PreferenceManager.getInstance().setString(PREFS_ANALYSE_THREADS, PREF_EXPECTED_THREADS_PATH, expectedThreadsFile.getParentFile().getPath(), false);
		PreferenceManager.getInstance().setString(PREFS_ANALYSE_THREADS, PREF_EXPECTED_THREADS_FILE, expectedThreadsFile.getPath(), true);
		
		
		// Load expected threads info from the file chosen above
		setWaitCursor(true);
		try {
			m_knownThreadsMgr.load(expectedThreadsFile);
			if (m_analyser != null)
				m_analyser.processKnownThreads(m_knownThreadsMgr);
		} catch (Exception e) {
			e.printStackTrace();
			JOptionPane.showMessageDialog(m_frame, "Error loading expected threads info': \n" + e, "Error", JOptionPane.ERROR_MESSAGE);
		}

		setHasExpectedThreads(m_knownThreadsMgr.getCount() > 0);
		
		// Need to refresh screen (at least the MatchedThreadsPane)
		// Also results in call to setSelectedThreadGroup() which updates
		// menu items etc. in line with new known thread info'
		if (m_hasThreadDumps) m_frame.refresh();
		
		setWaitCursor(false);
		
	}

	// Displays file chooser, then save expected threads info to the selected file
	public void saveExpectedThreads() {
	
		if (!getHasExpectedThreads()) {
			JOptionPane.showMessageDialog(m_frame, "No expected threads info to save", "Error", JOptionPane.ERROR_MESSAGE);
			return;
		}		

        setWaitCursor(true);
        
        try {
            // Prompt for file to load expected threads info from
            JFileChooser chooser = new JFileChooser();
            chooser.setDialogTitle("Save Expected Threads Info");

            // Set start directory based on user prefs
            String startDirName = PreferenceManager.getInstance().getString(PREFS_ANALYSE_THREADS, PREF_EXPECTED_THREADS_PATH, null);
            File startDir = startDirName != null ? new File(startDirName) : null;
            if (startDir != null && startDir.isDirectory() && startDir.canExecute()) {
                chooser.setCurrentDirectory(startDir);
            }

            int option = chooser.showSaveDialog(m_frame);
            if (option == JFileChooser.APPROVE_OPTION) {
                java.io.File outputFile = chooser.getSelectedFile();

                if (outputFile != null) {

                    if (outputFile.exists()) {
                        String msg = "File " + outputFile + " already exists. Overwrite?";
                        int result = JOptionPane.showConfirmDialog(m_frame, msg, "File exists", JOptionPane.YES_NO_OPTION, JOptionPane.QUESTION_MESSAGE);
                        if (result != JOptionPane.YES_OPTION)
                            return;
                    }

                    saveExpectedThreads(outputFile);
                }
            }
        } finally {
            setWaitCursor(false);
        }


	}
	
	// Save expected threads info to the selected file
	public void saveExpectedThreads(File expectedThreadsFile) {
		
		System.out.println("Saving expected threads info to " + expectedThreadsFile);
		if (expectedThreadsFile == null) return;		
		
		PreferenceManager.getInstance().setString(PREFS_ANALYSE_THREADS, PREF_EXPECTED_THREADS_PATH, expectedThreadsFile.getParentFile().getPath(), false);
		PreferenceManager.getInstance().setString(PREFS_ANALYSE_THREADS, PREF_EXPECTED_THREADS_FILE, expectedThreadsFile.getPath(), true);
		
		
		// Load expected threads info from the file chosen above
		setWaitCursor(true);
		try {
			m_knownThreadsMgr.save(expectedThreadsFile);
		} catch (Exception e) {
			e.printStackTrace();
			JOptionPane.showMessageDialog(m_frame, "Error saving expected threads info': \n" + e, "Error", JOptionPane.ERROR_MESSAGE);
		}
		
		setWaitCursor(false);
		
	}	
	
	
	public void markExpectedThread(boolean isGood) {
		
		// If state of selected thread already matches new value then there's nothing to do 
		if (m_selectedThreadGroup.isGoodThread() == isGood)
			return;
			
		setWaitCursor(true);
		try {
		    if (isGood) {
		        m_knownThreadsMgr.add(m_selectedThreadGroup.getNormalisedThread());
		    } else {
		        m_knownThreadsMgr.remove(m_selectedThreadGroup.getNormalisedThread());			
		    }
		    m_analyser.processKnownThreads(m_knownThreadsMgr);
		    setHasExpectedThreads(m_knownThreadsMgr.getCount() > 0);
		    setSelectedThreadIsExpected(isGood ? ThreadExpectedState.EXPECTED : ThreadExpectedState.UNRECOGNISED);  // updates menu items
		    m_frame.refresh();
		} finally {
		    setWaitCursor(false);
		}
	}
	
	// Marks all threads in the currently selected thread dump as good
	public void markAllThreadsExpected() {
		if (!m_hasThreadDumps || m_analyser == null || m_selectedThreadDump == null) return;
		
		setWaitCursor(true);
		
		try {
		    for (MatchedThreadGroup tg : m_selectedThreadDump.getMatchedThreads()) {
		        m_knownThreadsMgr.add(tg.getNormalisedThread());
		    }
		
		    m_analyser.processKnownThreads(m_knownThreadsMgr);
		    setHasExpectedThreads(m_knownThreadsMgr.getCount() > 0);
		    m_frame.refresh();
		} finally {
		    setWaitCursor(false);
		}
	}
	
	public void clearExpectedThreads() {
		setWaitCursor(true);
		try {
		    m_knownThreadsMgr.clear();
		    setHasExpectedThreads(false);
		    if (m_hasThreadDumps) {
		        m_analyser.processKnownThreads(m_knownThreadsMgr);
		        m_frame.refresh();
		    }
		} finally {
		    setWaitCursor(false);
		}
	}

    public void setIgnoreThreadNames(boolean ignore) {
        setWaitCursor(true);
        try {
            m_knownThreadsMgr.setIncludeThreadNames(!ignore);
            if (m_hasThreadDumps) {
                m_analyser.processKnownThreads(m_knownThreadsMgr);
                m_frame.refresh();
            }
        } finally {
            setWaitCursor(false);
        }
    }
    
    public boolean getIgnoreThreadNames() {
        return !m_knownThreadsMgr.getIncludeThreadNames();
    }
    
	public void setIgnoreThreadStates(boolean ignore) {
		setWaitCursor(true);
		try {
		    m_knownThreadsMgr.setIncludeThreadStates(!ignore);
		    if (m_hasThreadDumps) {
		        m_analyser.processKnownThreads(m_knownThreadsMgr);
		        m_frame.refresh();
		    }
		} finally {
		    setWaitCursor(false);
		}
	}
	
	public boolean getIgnoreThreadStates() {
		return !m_knownThreadsMgr.getIncludeThreadStates();
	}
	
	public void find() {
	    String searchString = JOptionPane.showInputDialog(m_frame, "Search for:");
	    if (searchString == null) return;  // operation cancelled - just return (don't clear search string)
	    
        if (searchString.length() == 0)
            searchString = null;  // clear search string if left empty and 'OK' clicked
	    
        setSearchString(searchString);  
        
	    // Reset search position to start
	    
	    // Do find
	    findNext();
	}
	
    public void findNext() {
        String searchString = getSearchString();
        if (searchString == null) return;
        
        JOptionPane.showMessageDialog(m_frame, "Find functionality not yet implemented", "Warning", JOptionPane.WARNING_MESSAGE);        
    }	
	
	public void exit() {
			System.exit(0);
	}
	
	
    private void setWaitCursor(boolean on) {
    	
    	Component glassPane = m_frame.getGlassPane();
    	
        if (on) {
            glassPane.setCursor(WAIT_CURSOR);
            glassPane.addMouseListener(nullMouseAdapter);
            glassPane.setVisible(true);
        } else {
            glassPane.setCursor(DEFAULT_CURSOR);
            glassPane.removeMouseListener(nullMouseAdapter);
            glassPane.setVisible(false);
        }
    }

	
    public void addPropertyChangeListener( PropertyChangeListener listener )
    {
        propChangeSupport.addPropertyChangeListener(listener);
    }

    public void removePropertyChangeListener(PropertyChangeListener listener)
    {
		propChangeSupport.removePropertyChangeListener(listener);
    }
	

	public static void main(String[] args) {

		File logfiles[] = null;
		String readerName = null;
		
		if (args.length > 0) {

			int firstFilenameIndex = -1;

			// Parse options
			for (int i = 0; i < (args.length); i++) {
				String arg = args[i];

				if (!arg.startsWith("-")) {
				
					// Found a filename - assume all remaining arguments are filenames
					firstFilenameIndex = i;
					break;
				
				} else {
					
					// Process other options/flags
					if (arg.equals("-format")) {
					
						if (i == args.length - 1 || args[i+1].startsWith("-")) {
							System.err.println("Error: missing format id");
							System.exit(1);
						}
						readerName = args[++i];
						
					} else if (arg.equals("-verbose")) {
						
						AnalyseThreads.DEBUG = true;
						
					} else if (arg.equals("-h")) {
						
						printUsage();
						System.exit(1);
						
					} else {
						
						System.err.println("Error: unexpected argument: " + arg);
						printUsage();
						System.exit(1);

					}
				
				}
			}

			// Get files if filenames have been provided
			if (firstFilenameIndex >= 0) {
				
				int numFilenames = args.length - firstFilenameIndex;
				logfiles = new File[numFilenames];
				
				for (int i = 0; i < numFilenames; i++) {
					
					String filename = args[firstFilenameIndex + i];
					logfiles[i] = new File(filename).getAbsoluteFile();
					if (!logfiles[i].canRead()) {
						System.err.println("File " + filename + " not found, or not readable");
						System.exit(1);
					}	
					
				}
				
			}
		}
		
		AnalyseThreadsGUI app = new AnalyseThreadsGUI();
		
		if (readerName != null) app.setReaderName(readerName);
		
		if (logfiles != null) {
			
			// Create array of File objects with just the one logfile entry
			//File [] logfiles = new File [] {logfile};

			app.openDumps(logfiles);
		}
		
		// Give user the option of reloading the expected threads file they were last using
		String expectedThreadsFilename = PreferenceManager.getInstance().getString(PREFS_ANALYSE_THREADS, PREF_EXPECTED_THREADS_FILE, null);
		File expectedThreadsFile = expectedThreadsFilename != null ? new File(expectedThreadsFilename) : null;
		if (expectedThreadsFile != null && expectedThreadsFile.isFile() && expectedThreadsFile.canRead()) {
			String msg = "Load the expected threads info used previously?\n" +
				"(" + expectedThreadsFilename + ")";
			int result = JOptionPane.showConfirmDialog(app.m_frame, msg, "Reload expected threads info", JOptionPane.YES_NO_OPTION, JOptionPane.QUESTION_MESSAGE);
			if (result == JOptionPane.YES_OPTION) app.loadExpectedThreads(expectedThreadsFile);	
		}		
		
	}

	private static void printUsage() {
		System.err.println();
		System.err.println("Analyse Threads (GUI), " + AnalyseThreads.VERSION_STRING);
		System.err.println();
		System.err.println("Usage: java AnalyseThreadsGUI [options] {<logfile>}");
		System.err.println();
		System.err.println("Options:");
		System.err.println("  -format <name>  :  force use of a specific thread dump reader");
		System.err.println("                     (e.g. Sun, IBM, ...).  By default the log format");
		System.err.println("                     is tested and the reader selected automatically");
		System.err.println("  -h              :  display this help information");
		System.err.println();
		AnalyseThreads.displayAvailableFormats(System.err);
	}	
	
}
