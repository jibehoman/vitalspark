package pbm.debugutil.gui;

import java.awt.Dimension;
import java.awt.HeadlessException;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.LinkedHashMap;

import javax.swing.JFrame;
import javax.swing.JOptionPane;
import javax.swing.JSplitPane;

import pbm.debugutil.AnalyseThreadsGUI;
import pbm.debugutil.ThreadDump;

@SuppressWarnings("serial")
public class ATMainFrame extends JFrame {
	
	private static final String AT_TITLE = "Analyse Threads";
	
    private static final SimpleDateFormat DUMP_LABEL_TIMESTAMP_FORMAT_TIME = new SimpleDateFormat("HH:mm:ss");
    private static final SimpleDateFormat DUMP_LABEL_TIMESTAMP_FORMAT_DATE = new SimpleDateFormat("dd/MM");
	
	
	private AnalyseThreadsGUI m_app;
	
	// Collection of saved information about the display state of each dump
	// (selected thread group, thread, etc...) so we can restore the view when
	// the dump is re-selected
	private HashMap<ThreadDump, ThreadDumpDisplayInfo> m_displayInfo = null;
	
	private ATMenuBar m_menubar;
	private ATMatchedThreadsTabs m_tabs;
	private ATMatchedThreadsPane m_matchedThreadsPane;	
	private ATRawThreadsPane m_rawThreadsPane;

	public ATMainFrame(AnalyseThreadsGUI app) throws HeadlessException {
		super(AT_TITLE);

		m_app = app;

		m_menubar = new ATMenuBar(m_app);
		setJMenuBar(m_menubar);
		
		setSize(new Dimension(500, 400));
	}

	public void showAnalysis() {
		
		// Clear previous results
		getContentPane().removeAll();
		
		if (m_app.getAnalyser() == null || m_app.getAnalyser().getNumDumps() < 1) {
			this.setTitle(AT_TITLE);
			JOptionPane.showMessageDialog(this, "No thread dumps found", "Error", JOptionPane.ERROR_MESSAGE);
		} else {
		
			buildDisplayInfo();

			String title = m_app.getAnalyser().getTitle();
			title = (title == null) ? "<no file>" : title;
			this.setTitle(AT_TITLE + " (" + title + ")");
			
			m_rawThreadsPane = new ATRawThreadsPane();
			m_matchedThreadsPane = new ATMatchedThreadsPane(m_rawThreadsPane);
			m_tabs = new ATMatchedThreadsTabs();
			
			JSplitPane sp = new JSplitPane(JSplitPane.VERTICAL_SPLIT, m_tabs, m_rawThreadsPane);
			getContentPane().add(sp);
			
		}

		this.pack();
		this.repaint();
		
	}
	
	public void showEmpty() {
		setTitle(AT_TITLE);
		getContentPane().removeAll();
		setSize(new Dimension(500, 400));
		repaint();
	}
	
	public void refresh() {
		if (m_matchedThreadsPane != null)
			m_matchedThreadsPane.refresh();
	}
	
	public ATMatchedThreadsPane getMatchedThreadsPane() {
		return m_matchedThreadsPane;
	}
	
	public ATRawThreadsPane getRawThreadsPane() {
		return m_rawThreadsPane;
	}	
	
	// Build display info collection
	private void buildDisplayInfo() {
		
		int numDumps = m_app.getAnalyser().getNumDumps();
		m_displayInfo = new LinkedHashMap<ThreadDump, ThreadDumpDisplayInfo>(numDumps);
		
		String prevDumpDate = "n/a";
		
		for (int dumpId = 0; dumpId < numDumps; dumpId++) {
			ThreadDump td = m_app.getAnalyser().getThreadDumps().get(dumpId);
			
			// Build tab label, e.g. "Dump-1", "Dump 1 - 13:05:02", or "Dump 1 - 13:05:02 (15/02)"
			// To save space, date part is only shown if different from previous dump
			StringBuilder label = new StringBuilder();
			label.append("Dump ").append(dumpId + 1);
			if (td.getTimeStamp() != null)
			{
				String dumpTime = DUMP_LABEL_TIMESTAMP_FORMAT_TIME.format(td.getTimeStamp());
			    String dumpDate = DUMP_LABEL_TIMESTAMP_FORMAT_DATE.format(td.getTimeStamp());
				label.append(" - ").append(dumpTime);
				if (!dumpDate.equals(prevDumpDate))
					label.append(" (").append(dumpDate).append(')');
				prevDumpDate = dumpDate;
			}
			
			ThreadDumpDisplayInfo info = new ThreadDumpDisplayInfo(label.toString(), td);
			m_displayInfo.put(td, info);
		}
	}
	
	// Save current display info for current dump
	// (called immediately prior to tab switch)
	public void saveDisplayInfo() {
		m_matchedThreadsPane.saveDisplayInfo();
	}

	// Retrieve display info for given dump
	// (used during tab switch)
	public ThreadDumpDisplayInfo getDisplayInfo(ThreadDump td) {
		return m_displayInfo.get(td);
	}

	// Clears selection info for current dump
	// (called as tab switch completes to avoid after-effects,
	//  e.g. when changing thread group within the same tab) 
	public void resetDisplayInfo() {
		m_matchedThreadsPane.resetDisplayInfo();
	}

}
