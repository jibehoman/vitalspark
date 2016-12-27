package pbm.debugutil.gui.action;

import java.awt.event.ActionEvent;
import java.awt.event.KeyEvent;

import javax.swing.AbstractAction;

import pbm.debugutil.AnalyseThreadsGUI;

@SuppressWarnings("serial")
public class ATIgnoreThreadStatesAction extends AbstractAction {

	private static ATIgnoreThreadStatesAction s_instance = null;
	
	private ATIgnoreThreadStatesAction() {
		super("Ignore Thread States");
		putValue(MNEMONIC_KEY, KeyEvent.VK_I);
		putValue(SELECTED_KEY, AnalyseThreadsGUI.getInstance().getIgnoreThreadStates()); 
	}
	
	public void actionPerformed(ActionEvent evt) {
		boolean isSelected = (Boolean)getValue(SELECTED_KEY);
		AnalyseThreadsGUI.getInstance().setIgnoreThreadStates(isSelected);		
	}
	
	public static ATIgnoreThreadStatesAction getInstance() {
		if (s_instance == null) {
			s_instance = new ATIgnoreThreadStatesAction();
		}
		return s_instance;
	}

}
