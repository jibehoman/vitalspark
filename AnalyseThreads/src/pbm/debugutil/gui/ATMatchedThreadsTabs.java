package pbm.debugutil.gui;

import javax.swing.JPanel;
import javax.swing.JTabbedPane;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;

import pbm.debugutil.AnalyseThreadsGUI;
import pbm.debugutil.ThreadDump;

@SuppressWarnings("serial")
public class ATMatchedThreadsTabs extends JTabbedPane implements ChangeListener {

	AnalyseThreadsGUI m_app;
	
	int m_selectedTab = -1;
    JPanel [] m_dummyPanels;

	public ATMatchedThreadsTabs() {
		
		m_app = AnalyseThreadsGUI.getInstance();
		
		int numDumps = m_app.getAnalyser().getNumDumps();
		m_dummyPanels = new JPanel[numDumps];

		for (int i = 0; i < numDumps; i++) {
			ThreadDump td = m_app.getAnalyser().getThreadDumps().get(i);
			m_dummyPanels[i] = new JPanel();
			addTab(m_app.getMainFrame().getDisplayInfo(td).getName(), m_dummyPanels[i]);
		}

		updateTabs();
		
		this.addChangeListener(this);
	}
	
	private void updateTabs() {
		// replace content of last tab with dummy panel
		if (m_selectedTab >= 0)
			this.setComponentAt(m_selectedTab, m_dummyPanels[m_selectedTab]);
		
		// replace content of new tab with matched threads panel
		m_selectedTab = this.getSelectedIndex();
		this.setComponentAt(getSelectedIndex(), m_app.getMainFrame().getMatchedThreadsPane());
		
		// Update selected thread dump in main app - fires property change event
		m_app.setSelectedThreadDump(m_app.getAnalyser().getThreadDumps().get(m_selectedTab));		
	}
	
	public void stateChanged(ChangeEvent e) {
		m_app.getMainFrame().saveDisplayInfo();
		updateTabs();
		m_app.getMainFrame().resetDisplayInfo();
	}
	
}
