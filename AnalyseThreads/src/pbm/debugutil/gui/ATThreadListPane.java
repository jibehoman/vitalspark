package pbm.debugutil.gui;

import java.awt.BorderLayout;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.util.Vector;

import javax.swing.JList;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.ListSelectionModel;
import javax.swing.event.ListSelectionEvent;
import javax.swing.event.ListSelectionListener;

import pbm.debugutil.AnalyseThreadsGUI;
import pbm.debugutil.MatchedThreadGroup;
import pbm.debugutil.RawThread;

@SuppressWarnings("serial")
public class ATThreadListPane extends JPanel implements PropertyChangeListener, ListSelectionListener {

	AnalyseThreadsGUI m_app;
	
	Vector<String> m_rawThreadNames;
	Vector<String> m_rawThreadIds;
	
	JList m_threadList;
	
	
public ATThreadListPane() {
		super();
		
		m_app = AnalyseThreadsGUI.getInstance();
		
	    setLayout(new BorderLayout());

		add(new javax.swing.JLabel("Matching Threads"), BorderLayout.NORTH);
		
		m_threadList = new JList();
		m_threadList.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
		add(new JScrollPane(m_threadList), BorderLayout.CENTER);
		
		m_threadList.addListSelectionListener(this);
		
		// Listen for changes to selected thread group
		m_app.addPropertyChangeListener(this);
	}

	private void threadGroupChanged(MatchedThreadGroup group) {
		m_rawThreadNames = new Vector<String>();
		m_rawThreadIds = new Vector<String>();
	
		for (RawThread rt : group.getRawThreads()) {
			m_rawThreadNames.add(rt.getName());
			m_rawThreadIds.add(rt.getTid());
		}
		m_threadList.setListData(m_rawThreadNames);
		m_threadList.setSelectedIndex(0);
		
		// Restore selection and scroll posn' if needed (i.e. when switching tabs)
		ThreadDumpDisplayInfo info = m_app.getMainFrame().getDisplayInfo(m_app.getSelectedThreadDump());
		if (info.getSelectedThreadGroup() == group) {
			if (info.getSelectedThreadIndex() >= 0) {
				m_threadList.setSelectedIndex(info.getSelectedThreadIndex());
				m_threadList.scrollRectToVisible(info.getThreadsScrollRect());
			}
		}

	}

	public void propertyChange(PropertyChangeEvent evt) {
		if (evt.getPropertyName() == AnalyseThreadsGUI.SELECTED_THREAD_GROUP_PROPERTY) {
			MatchedThreadGroup group = (MatchedThreadGroup)evt.getNewValue();
			threadGroupChanged(group);
		}
	}
	
	public void valueChanged(ListSelectionEvent e) {

		if (!e.getValueIsAdjusting()) {
        	int index = m_threadList.getSelectedIndex();
        	String selectedThreadId = (index >= 0) ? m_rawThreadIds.elementAt(index) : null;
    		m_app.setSelectedThreadId(selectedThreadId);
        }
		
	}

	public void saveDisplayInfo() {
		ThreadDumpDisplayInfo info = m_app.getMainFrame().getDisplayInfo(m_app.getSelectedThreadDump());
		info.setSelectedThreadIndex(m_threadList.getSelectedIndex());
		info.setThreadsScrollRect(m_threadList.getVisibleRect());		
	}

}
