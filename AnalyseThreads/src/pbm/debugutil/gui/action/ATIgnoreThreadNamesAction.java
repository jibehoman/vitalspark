package pbm.debugutil.gui.action;

import java.awt.event.ActionEvent;
import java.awt.event.KeyEvent;

import javax.swing.AbstractAction;

import pbm.debugutil.AnalyseThreadsGUI;

@SuppressWarnings("serial")
public class ATIgnoreThreadNamesAction extends AbstractAction {

	private static ATIgnoreThreadNamesAction s_instance = null;
	
	private ATIgnoreThreadNamesAction() {
		super("Ignore Thread Names");
		putValue(MNEMONIC_KEY, KeyEvent.VK_N);
		putValue(SELECTED_KEY, AnalyseThreadsGUI.getInstance().getIgnoreThreadNames()); 
	}
	
	public void actionPerformed(ActionEvent evt) {
		boolean isSelected = (Boolean)getValue(SELECTED_KEY);
		AnalyseThreadsGUI.getInstance().setIgnoreThreadNames(isSelected);		
	}
	
	public static ATIgnoreThreadNamesAction getInstance() {
		if (s_instance == null) {
			s_instance = new ATIgnoreThreadNamesAction();
		}
		return s_instance;
	}

}
