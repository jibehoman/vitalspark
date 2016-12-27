package pbm.debugutil.gui.action;

import java.awt.event.ActionEvent;
import java.awt.event.KeyEvent;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;

import javax.swing.AbstractAction;

import pbm.debugutil.AnalyseThreadsGUI;

@SuppressWarnings("serial")
public class ATToggleExpectedThreadAction extends AbstractAction implements PropertyChangeListener {

	private static String ADD_LABEL = "Mark As Expected Thread";
	private static int ADD_MNEMONIC = KeyEvent.VK_M;
	private static String REMOVE_LABEL = "Remove From Expected Threads";
	private static int REMOVE_MNEMONIC = KeyEvent.VK_R;
	
	private static ATToggleExpectedThreadAction s_instance = null;
	
	private ATToggleExpectedThreadAction() {
		super();
		updateState(AnalyseThreadsGUI.getInstance().getSelectedThreadIsExpected());

		AnalyseThreadsGUI.getInstance().addPropertyChangeListener(this);
	}
	
	public void actionPerformed(ActionEvent evt) {
		if (evt.getActionCommand().equals(ADD_LABEL))
			AnalyseThreadsGUI.getInstance().markExpectedThread(true);
		else if (evt.getActionCommand().equals(REMOVE_LABEL))
			AnalyseThreadsGUI.getInstance().markExpectedThread(false);
	}
	
	public static ATToggleExpectedThreadAction getInstance() {
		if (s_instance == null) {
			s_instance = new ATToggleExpectedThreadAction();
		}
		return s_instance;
	}
	
	private void updateState(AnalyseThreadsGUI.ThreadExpectedState expected) {
//		AnalyseThreadsGUI app = AnalyseThreadsGUI.getInstance();
		switch (expected) {
		
		case UNRECOGNISED :
			putValue(NAME, ADD_LABEL);
			putValue(MNEMONIC_KEY, ADD_MNEMONIC);
			setEnabled(true);
			break;
			
		case EXPECTED :
			putValue(NAME, REMOVE_LABEL);
			putValue(MNEMONIC_KEY, REMOVE_MNEMONIC);
			setEnabled(true);
			break;	
			
		default:
			putValue(NAME, ADD_LABEL);
			putValue(MNEMONIC_KEY, ADD_MNEMONIC);
			setEnabled(false);			

		}

/*			
		
		if (app == null || app.getSelectedThreadGroup() == null) {
			putValue(NAME, ADD_LABEL);
			putValue(MNEMONIC_KEY, ADD_MNEMONIC);
			setEnabled(false);
		} else {
			if (app.getSelectedThreadIsExpected()) {
				putValue(NAME, REMOVE_LABEL);
				putValue(MNEMONIC_KEY, REMOVE_MNEMONIC);
			} else {
				putValue(NAME, ADD_LABEL);
				putValue(MNEMONIC_KEY, ADD_MNEMONIC);
			}
			setEnabled(true);
		}
		*/
	}

	public void propertyChange(PropertyChangeEvent evt) {
		if (evt.getPropertyName() == AnalyseThreadsGUI.SELECTED_THREAD_IS_EXPECTED_PROPERTY) {
			updateState((AnalyseThreadsGUI.ThreadExpectedState)evt.getNewValue());
		}
	}

}
