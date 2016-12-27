package pbm.debugutil.gui.action;

import java.awt.event.ActionEvent;
import java.awt.event.KeyEvent;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;

import javax.swing.AbstractAction;

import pbm.debugutil.AnalyseThreadsGUI;

@SuppressWarnings("serial")
public class ATMarkAllThreadsExpectedAction extends AbstractAction implements PropertyChangeListener {

	private static ATMarkAllThreadsExpectedAction s_instance = null;
	
	private ATMarkAllThreadsExpectedAction() {
		super("Mark All Threads As Expected");
		putValue(MNEMONIC_KEY, KeyEvent.VK_A);
		setEnabled(false);
		
		AnalyseThreadsGUI.getInstance().addPropertyChangeListener(this);		
	}
	
	public void actionPerformed(ActionEvent evt) {
		AnalyseThreadsGUI.getInstance().markAllThreadsExpected();		
	}
	
	public static ATMarkAllThreadsExpectedAction getInstance() {
		if (s_instance == null) {
			s_instance = new ATMarkAllThreadsExpectedAction();
		}
		return s_instance;
	}
	
	public void propertyChange(PropertyChangeEvent evt) {
		if (evt.getPropertyName() == AnalyseThreadsGUI.HAS_THREAD_DUMPS_PROPERTY) {
			setEnabled((Boolean)evt.getNewValue());
		}
	}	

}
