package pbm.debugutil.gui;

import java.awt.BorderLayout;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.util.Vector;

import javax.swing.JList;
import javax.swing.JScrollPane;
import javax.swing.ListSelectionModel;
import javax.swing.JPanel;

import pbm.debugutil.AnalyseThreadsGUI;
import pbm.debugutil.MatchedThreadGroup;
import pbm.debugutil.NormalisedThread;

@SuppressWarnings("serial")
public class ATNormalisedStackPane extends JPanel implements PropertyChangeListener {

	JList m_stackList;

	public ATNormalisedStackPane() {
		super();
		
	    setLayout(new BorderLayout());

		add(new javax.swing.JLabel("Normalised Stack"), BorderLayout.NORTH);
		
		m_stackList = new JList();
		m_stackList.setSelectionMode(ListSelectionModel.SINGLE_INTERVAL_SELECTION);
		add(new JScrollPane(m_stackList), BorderLayout.CENTER);
		
		// Listen for changes to selected thread group
		AnalyseThreadsGUI.getInstance().addPropertyChangeListener(this);
	}

	private void threadGroupChanged(MatchedThreadGroup group) {
		
		NormalisedThread nthread = group.getNormalisedThread();

		Vector<String> stack = new Vector<String>();
		stack.add(nthread.getName() + " [" + nthread.getState() + "]");
		for (String s : nthread.getDeobfuscatedStack()) {
			stack.add("  " + s);
		}
		m_stackList.setListData(stack);
		
	}
	
	public void propertyChange(PropertyChangeEvent evt) {
		if (evt.getPropertyName() == AnalyseThreadsGUI.SELECTED_THREAD_GROUP_PROPERTY) {
			MatchedThreadGroup group = (MatchedThreadGroup)evt.getNewValue();
			threadGroupChanged(group);
		}
	}	

}
