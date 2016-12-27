package pbm.debugutil.gui;

import java.awt.BorderLayout;
import java.awt.Rectangle;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.util.Vector;

import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JPopupMenu;
import javax.swing.JScrollPane;
import javax.swing.JSplitPane;
import javax.swing.event.ListSelectionEvent;
import javax.swing.event.ListSelectionListener;

import pbm.debugutil.AnalyseThreadsGUI;
import pbm.debugutil.MatchedThreadGroup;
import pbm.debugutil.ThreadDump;
import pbm.debugutil.gui.action.ATMarkAllThreadsExpectedAction;
import pbm.debugutil.gui.action.ATToggleExpectedThreadAction;

@SuppressWarnings("serial")
public class ATMatchedThreadsPane extends JPanel implements PropertyChangeListener, ListSelectionListener, MouseListener {

	AnalyseThreadsGUI m_app;
	
	ThreadDump m_threadDump;
	Vector<MatchedThreadGroup> m_matchedThreads;
	MatchedThreadGroup m_selectedThreadGroup;  // Don't necessarily need to store/expose this here - this is now being passed to/held by AnalyseThreadsGUI (perhaps better to create a separate class entirely to keep this type of info?) 
		
	JPanel m_threadGroupsPanel;
	ATThreadListPane m_threadListPane;
	ATNormalisedStackPane m_normalisedStackPane;
	
	JLabel m_threadGroupsLabel;
	
	ATThreadGroupsTable m_threadGroupsTable;	
	ATThreadGroupsTableModel m_model;	
	
	private static JPopupMenu m_threadGroupsPopupMenu = null;	
	
	public ATMatchedThreadsPane(ATRawThreadsPane rawThreadsPane) {
		super(new BorderLayout());
		
		m_app = AnalyseThreadsGUI.getInstance();

	    // Build Thread Groups panel
	    m_threadGroupsPanel = new JPanel();
	    m_threadGroupsPanel.setLayout(new BorderLayout());
	    m_threadGroupsLabel = new JLabel("<dummy>");
	    m_threadGroupsPanel.add(m_threadGroupsLabel, BorderLayout.NORTH);

	    // Need some kind of model when creating table so just use first thread dump for now
	    ThreadDump td = m_app.getAnalyser().getThreadDumps().get(0);
	    m_model = new ATThreadGroupsTableModel(td);
	    m_threadGroupsTable = new ATThreadGroupsTable(m_model);
	    m_threadGroupsTable.getSelectionModel().addListSelectionListener(this);
	    m_threadGroupsPanel.add(new JScrollPane(m_threadGroupsTable), BorderLayout.CENTER);	    

		// Build remaining panels
		m_threadListPane = new ATThreadListPane();
		m_normalisedStackPane = new ATNormalisedStackPane();
		JSplitPane groupDetailSplitPane = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, m_threadListPane, m_normalisedStackPane);
		
		JSplitPane sp = new JSplitPane(JSplitPane.VERTICAL_SPLIT, m_threadGroupsPanel, groupDetailSplitPane);
		
		add(sp, BorderLayout.CENTER);
		
		if (m_threadGroupsPopupMenu == null) {
			m_threadGroupsPopupMenu = new JPopupMenu();
			m_threadGroupsPopupMenu.add(ATToggleExpectedThreadAction.getInstance());			
			m_threadGroupsPopupMenu.addSeparator();			
			m_threadGroupsPopupMenu.add(ATMarkAllThreadsExpectedAction.getInstance());			
		}
		
		m_threadGroupsTable.addMouseListener(this);	
		
		// Listen for changes to selected thread dump
		m_app.addPropertyChangeListener(this);

	}
	
	private void showThreadDump(ThreadDump dump) {
		ThreadDumpDisplayInfo displayInfo = m_app.getMainFrame().getDisplayInfo(dump);
		m_threadDump = displayInfo.getThreadDump();
		
		m_threadGroupsLabel.setText("Thread Groups (" + m_threadDump.getThreadCount() +
	    		" threads matched to " + m_threadDump.getMatchedThreads().size() + " groups)");
		
		m_model.changeThreadDump(dump);
		
		// Set selected row using saved info
		int row = displayInfo.getSelectedGroupIndex();
		row = (row < 0) ? 0 :  m_threadGroupsTable.convertRowIndexToView(row);
	    m_threadGroupsTable.getSelectionModel().setSelectionInterval(row, row);
	    
	    // Scroll to saved position
	    Rectangle visibleRect = displayInfo.getGroupsScrollRect();
	    if (visibleRect != null)
	    	m_threadGroupsTable.scrollRectToVisible(visibleRect);
	    
	    // Now ensure scrolled so selected line is visible (may not be within
	    // saved scroll posn if sort order has changed since we saved this info')
	    m_threadGroupsTable.scrollRectToVisible(m_threadGroupsTable.getCellRect(row, 0, false));
	}
	
	public void propertyChange(PropertyChangeEvent evt) {
		if (evt.getPropertyName() == AnalyseThreadsGUI.SELECTED_THREAD_DUMP_PROPERTY) {
			ThreadDump td = (ThreadDump)evt.getNewValue();
			showThreadDump(td);
		}
	}	

	public void saveDisplayInfo() {
		ThreadDumpDisplayInfo info = m_app.getMainFrame().getDisplayInfo(m_threadDump);
   		int index = m_threadGroupsTable.convertRowIndexToModel(m_threadGroupsTable.getSelectedRow());
   		info.setSelectedThreadGroup(m_selectedThreadGroup);
		info.setSelectedGroupIndex(index);
		info.setGroupsScrollRect(m_threadGroupsTable.getVisibleRect());
		
		m_threadListPane.saveDisplayInfo();
	}
	
	public void resetDisplayInfo() {
		ThreadDumpDisplayInfo info = m_app.getMainFrame().getDisplayInfo(m_threadDump);
		info.reset();
	}	
	
	public void valueChanged(ListSelectionEvent evt) {
        if (!evt.getValueIsAdjusting()) {
        	int index = 0;
        	try {
        		index = m_threadGroupsTable.convertRowIndexToModel(m_threadGroupsTable.getSelectedRow());
        	} catch (IndexOutOfBoundsException e) {}

        	m_selectedThreadGroup = m_threadDump.getMatchedThreads().get(index);

        	AnalyseThreadsGUI.getInstance().setSelectedThreadGroup(m_selectedThreadGroup, m_threadDump);
        }
	}
	
	public MatchedThreadGroup getSelectedThreadGroup() {
		return m_selectedThreadGroup;
	}
	
	// Called when known threads filter enabled/disabled so pane can be refreshed
	// Can also be used when enabling/removing de-obfuscation?
	// 'active' indicates whether this is the currently selected tab 
	public void refresh() {
   		int idx = m_threadGroupsTable.convertRowIndexToModel(m_threadGroupsTable.getSelectedRow());
   		
		m_model.fireTableDataChanged();
		
		idx = (idx < 0) ? 0 :  m_threadGroupsTable.convertRowIndexToView(idx);
	    m_threadGroupsTable.getSelectionModel().setSelectionInterval(idx, idx);
	    m_threadGroupsTable.scrollRectToVisible(m_threadGroupsTable.getCellRect(idx, 0, false));		
	}

	public void mouseClicked(MouseEvent e) {
		handlePopup(e);
	}

	public void mousePressed(MouseEvent e) {
		handlePopup(e);
	}

	public void mouseReleased(MouseEvent e) {
		handlePopup(e);
	}

	public void mouseEntered(MouseEvent e) {
	}

	public void mouseExited(MouseEvent e) {
	}
	
	// Select the item where the mouse was clicked before showing
	// the popup.  This ensures the popup's actions target the expected
	// thread group.
	private void handlePopup(MouseEvent e) {
		if (e.isPopupTrigger()) {
			int idx = m_threadGroupsTable.rowAtPoint(e.getPoint());
		    m_threadGroupsTable.getSelectionModel().setSelectionInterval(idx, idx);
        	m_threadGroupsPopupMenu.show(m_threadGroupsTable, e.getX(), e.getY());
		}		
	}
	
}
