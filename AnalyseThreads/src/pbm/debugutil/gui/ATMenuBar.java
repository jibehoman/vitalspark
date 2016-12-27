package pbm.debugutil.gui;

import java.awt.Container;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyEvent;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.io.File;

import javax.swing.JCheckBoxMenuItem;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.JOptionPane;
import javax.swing.KeyStroke;

import pbm.debugutil.AnalyseThreads;
import pbm.debugutil.AnalyseThreadsGUI;
import pbm.debugutil.gui.action.ATIgnoreThreadNamesAction;
import pbm.debugutil.gui.action.ATIgnoreThreadStatesAction;
import pbm.debugutil.gui.action.ATMarkAllThreadsExpectedAction;
import pbm.debugutil.gui.action.ATToggleExpectedThreadAction;

@SuppressWarnings("serial")
public class ATMenuBar extends JMenuBar implements ActionListener, PropertyChangeListener {

    private static final String MENU_LABEL_ANALYSE_LOGS = "Analyse Logs..."; 
    private static final String MENU_LABEL_ANALYSE_FROM_CLIPBOARD = "Analyse dump(s) from Clipboard"; 
    private static final String MENU_LABEL_COPY_TO_CLIPBOARD = "Copy selected dump to Clipboard"; 
    private static final String MENU_LABEL_WRITE_SUMMARY = "Write Summary to File..."; 
    private static final String MENU_LABEL_EXIT = "Exit"; 
    
    private static final String MENU_LABEL_EXPECTED_THREADS_LOAD = "Load Expected Threads Info...";
    private static final String MENU_LABEL_EXPECTED_THREADS_SAVE = "Save Expected Threads Info...";
    private static final String MENU_LABEL_EXPECTED_THREADS_CLEAR = "Clear Expected Threads Info";

    private static final String MENU_LABEL_DEOBFUCATION_APPLY = "Apply Deobfuscation...";
    private static final String MENU_LABEL_DEOBFUCATION_CLEAR = "Clear Deobfuscations";

    private static final String MENU_LABEL_FIND = "Find...";
    private static final String MENU_LABEL_FIND_NEXT = "Find Next";

    private static final String MENU_LABEL_ABOUT = "About";

    
	private AnalyseThreadsGUI m_analyseThreadsApp;
	File m_currentDir = null;
	File m_deobfDir = null;
	
	JMenuItem applyDeobfuscationMenuItem = null;
	JMenuItem clearDeobfuscationMenuItem = null;
    JMenuItem copyDumpMenuItem = null;
	JMenuItem writeSummaryMenuItem = null;
	JMenuItem saveExpectedThreadsMenuItem = null;
	JMenuItem clearExpectedThreadsMenuItem = null;
//    JMenuItem findMenuItem = null;
//    JMenuItem findNextMenuItem = null;

    
	public ATMenuBar(AnalyseThreadsGUI app) {
		
		m_analyseThreadsApp = app;
		
		JMenuItem item;
		
		JMenu fileMenu = new JMenu("File");
		fileMenu.setMnemonic(KeyEvent.VK_F);		
		item = new JMenuItem(MENU_LABEL_ANALYSE_LOGS, 'L');
		item.addActionListener(this);
		fileMenu.add(item);
		item = new JMenuItem(MENU_LABEL_ANALYSE_FROM_CLIPBOARD, 'P');
		item.addActionListener(this);
		item.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_V, ActionEvent.CTRL_MASK, false));
		fileMenu.add(item);
        fileMenu.addSeparator();
        item = new JMenuItem(MENU_LABEL_COPY_TO_CLIPBOARD, 'C');
        item.setEnabled(false);
        item.addActionListener(this);
        item.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_C, ActionEvent.CTRL_MASK, false));
        fileMenu.add(item);
        copyDumpMenuItem = item;
		item = new JMenuItem(MENU_LABEL_WRITE_SUMMARY, 'S');
		item.setEnabled(false);
		item.addActionListener(this);
		fileMenu.add(item);
		writeSummaryMenuItem = item;
		fileMenu.addSeparator();
		item = new JMenuItem(MENU_LABEL_EXIT, 'X');
		item.addActionListener(this);
		fileMenu.add(item);			

		JMenu filterMenu = new JMenu("Filter");
		filterMenu.setMnemonic(KeyEvent.VK_L);	
        filterMenu.add(new JCheckBoxMenuItem(ATIgnoreThreadNamesAction.getInstance()));
		filterMenu.add(new JCheckBoxMenuItem(ATIgnoreThreadStatesAction.getInstance()));
		filterMenu.add(ATToggleExpectedThreadAction.getInstance());
		filterMenu.addSeparator();
		filterMenu.add(ATMarkAllThreadsExpectedAction.getInstance());
		filterMenu.addSeparator();
		item = new JMenuItem(MENU_LABEL_EXPECTED_THREADS_LOAD, 'L');
		item.addActionListener(this);
		filterMenu.add(item);		
		item = new JMenuItem(MENU_LABEL_EXPECTED_THREADS_SAVE, 'S');
		item.setEnabled(false);
		item.addActionListener(this);
		filterMenu.add(item);
		saveExpectedThreadsMenuItem = item;
		item = new JMenuItem(MENU_LABEL_EXPECTED_THREADS_CLEAR, 'C');
		item.setEnabled(false);
		item.addActionListener(this);
		filterMenu.add(item);
		clearExpectedThreadsMenuItem = item;
		
		JMenu deobfMenu = new JMenu("Deobfuscation");
		deobfMenu.setMnemonic(KeyEvent.VK_D);	
		item = new JMenuItem(MENU_LABEL_DEOBFUCATION_APPLY, 'D');
		item.setEnabled(false);
		item.addActionListener(this);
		deobfMenu.add(item);
		applyDeobfuscationMenuItem = item;
		item = new JMenuItem(MENU_LABEL_DEOBFUCATION_CLEAR, 'C');
		item.setEnabled(false);
		item.addActionListener(this);
		deobfMenu.add(item);	
		clearDeobfuscationMenuItem = item;
		
/*        JMenu searchMenu = new JMenu("Search");
        searchMenu.setMnemonic(KeyEvent.VK_S);  
        item = new JMenuItem(MENU_LABEL_FIND, 'F');
        item.setEnabled(false);
        item.addActionListener(this);
        item.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_F, ActionEvent.CTRL_MASK, false));
        searchMenu.add(item);
        findMenuItem = item;
        item = new JMenuItem(MENU_LABEL_FIND_NEXT, 'N');
        item.setEnabled(false);
        item.addActionListener(this);
        item.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_F3, 0, false));
        searchMenu.add(item);		
        findNextMenuItem = item;*/
		
		JMenu helpMenu = new JMenu("Help");
		helpMenu.setMnemonic(KeyEvent.VK_H);		
		item = new JMenuItem(MENU_LABEL_ABOUT, 'A');
		item.addActionListener(this);
		helpMenu.add(item);
		
		add(fileMenu);
		add(filterMenu);
		add(deobfMenu);
//        add(searchMenu);
		add(helpMenu);
		
		m_analyseThreadsApp.addPropertyChangeListener(this);
	}

	
	private Container getParentFrame() {
		return this.getParent();
	}
	
	public void actionPerformed(ActionEvent ae) {
		
		if (ae.getActionCommand().equals(MENU_LABEL_ANALYSE_LOGS)) {

			m_analyseThreadsApp.openDumps();
			
		} else if (ae.getActionCommand().equals(MENU_LABEL_ANALYSE_FROM_CLIPBOARD)) {

			m_analyseThreadsApp.openDumpFromClipboard();
			
        } else if (ae.getActionCommand().equals(MENU_LABEL_COPY_TO_CLIPBOARD)) {

            m_analyseThreadsApp.copyDumpToClipboard();
			
		} else if (ae.getActionCommand().equals(MENU_LABEL_WRITE_SUMMARY)) {

			m_analyseThreadsApp.saveSummary();
			
        } else if (ae.getActionCommand().equals(MENU_LABEL_FIND)) {

            m_analyseThreadsApp.find();

        } else if (ae.getActionCommand().equals(MENU_LABEL_FIND_NEXT)) {

            m_analyseThreadsApp.findNext();

        } else if (ae.getActionCommand().equals(MENU_LABEL_DEOBFUCATION_APPLY)) {

			m_analyseThreadsApp.loadDeobfuscationInfo();
			
		} else if (ae.getActionCommand().equals(MENU_LABEL_DEOBFUCATION_CLEAR)) {
			
			System.out.println("Clearing deobfuscation info");
			m_analyseThreadsApp.clearDeobfuscationInfo();
			
		} else if (ae.getActionCommand().equals(MENU_LABEL_EXPECTED_THREADS_LOAD)) {
				
			m_analyseThreadsApp.loadExpectedThreads();
				
		} else if (ae.getActionCommand().equals(MENU_LABEL_EXPECTED_THREADS_SAVE)) {
				
			m_analyseThreadsApp.saveExpectedThreads();
				
		} else if (ae.getActionCommand().equals(MENU_LABEL_EXPECTED_THREADS_CLEAR)) {
			
			String msg = "Are you sure you want to clear the expected threads info'?";
			int result = JOptionPane.showConfirmDialog(getParentFrame(), msg, "Confirm", JOptionPane.YES_NO_OPTION, JOptionPane.QUESTION_MESSAGE);
			if (result != JOptionPane.YES_OPTION) return;
			m_analyseThreadsApp.clearExpectedThreads();

		} else if (ae.getActionCommand().equals(MENU_LABEL_ABOUT)) {
			
			JOptionPane.showMessageDialog(getParentFrame(), "AnalyseThreadsGUI " + AnalyseThreads.VERSION_STRING + "\nPaul Meadows (pmeadows@progress.com)\nProgress Software, 2007-2009", "About AnalyseThreadsGUI", JOptionPane.PLAIN_MESSAGE);
			
		} else if (ae.getActionCommand().equals(MENU_LABEL_EXIT)) {

			int response = JOptionPane.showConfirmDialog(getParentFrame(), "Do you want to exit?", "Exit", JOptionPane.YES_NO_OPTION);
			
			if (response == JOptionPane.YES_OPTION) {
				m_analyseThreadsApp.exit();
			}
			
		}
		

	}


	public void propertyChange(PropertyChangeEvent evt) {
		
		if (evt.getPropertyName() == AnalyseThreadsGUI.HAS_EXPECTED_THREADS_PROPERTY) {
			boolean hasExpectedThreads = (Boolean)evt.getNewValue();
			saveExpectedThreadsMenuItem.setEnabled(hasExpectedThreads);
			clearExpectedThreadsMenuItem.setEnabled(hasExpectedThreads);
		} else if (evt.getPropertyName() == AnalyseThreadsGUI.HAS_THREAD_DUMPS_PROPERTY) {
			boolean hasThreadDumpsLoaded = (Boolean)evt.getNewValue();
			copyDumpMenuItem.setEnabled(hasThreadDumpsLoaded);
			writeSummaryMenuItem.setEnabled(hasThreadDumpsLoaded);
			applyDeobfuscationMenuItem.setEnabled(hasThreadDumpsLoaded);
			clearDeobfuscationMenuItem.setEnabled(hasThreadDumpsLoaded);		
            clearDeobfuscationMenuItem.setEnabled(hasThreadDumpsLoaded);
//            findMenuItem.setEnabled(hasThreadDumpsLoaded);            
        } else if (evt.getPropertyName() == AnalyseThreadsGUI.SEARCH_STRING_PROPERTY) {
//            findNextMenuItem.setEnabled(evt.getNewValue() != null);            
        }
		
	}

}
