package pbm.debugutil.deobf;


import java.awt.BorderLayout;
import java.awt.Component;
import java.awt.Cursor;
import java.awt.Dimension;
import java.awt.event.ActionEvent;
import java.awt.event.FocusAdapter;
import java.awt.event.FocusEvent;
import java.awt.event.MouseAdapter;
import java.io.BufferedReader;
import java.io.File;
import java.io.StringReader;
import java.util.Vector;

import javax.swing.AbstractAction;
import javax.swing.JButton;
import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JList;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JSplitPane;
import javax.swing.JTextArea;

import net.iharder.dnd.FileDrop;


@SuppressWarnings("serial")
public class DeobfuscateFrame extends JFrame {
	
	
	private static final String VERSION_STRING = "v0.3";
	private static final String ABOUT_TEXT = "Sonic Deobfuscator " + VERSION_STRING + ", Paul Meadows, Progress Software";

	private static final String EMPTY_LOGS_LIST_TEXT = "<no obfuscation info - load or drag a JOBE log here>";
	private static final String EMPTY_INPUT_TEXT = "<enter obfuscated stack here>";
	private static final String EMPTY_OUTPUT_TEXT = "<no text to deobfuscate>";

    private static final Cursor DEFAULT_CURSOR = Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR);
    private static final Cursor WAIT_CURSOR = Cursor.getPredefinedCursor(Cursor.WAIT_CURSOR);
    private static final MouseAdapter nullMouseAdapter = new MouseAdapter() {};
	
	
	DeobfuscateManager m_deobfuscator;
	
	JList m_logsList = null;
	JTextArea m_inputText = null;
	JTextArea m_outputText = null;	
	
	public DeobfuscateFrame(DeobfuscateManager deobfuscator) {
	
		super("Deobfuscate GUI");
		m_deobfuscator = deobfuscator;

	}
	
	
	public void showGUI() {
		JPanel logsPanel = new JPanel(new BorderLayout());
		JPanel logsButtons = new JPanel();		
		JPanel obfPanel = new JPanel(new BorderLayout());
		JPanel obfButtons = new JPanel();		
		JPanel deobfPanel = new JPanel(new BorderLayout());
		
		JButton loadLogButton = new JButton(new LogJOBELogAction());
		JButton clearLogsButton = new JButton(new ClearObfInfoAction());
		JButton deobfButton = new JButton(new DeobfuscateAction());
		
		// Build JOBE logs panel
		m_logsList = new JList(m_deobfuscator.getLogs());
		m_logsList.setEnabled(false);
		
		logsButtons.add(loadLogButton);
		logsButtons.add(clearLogsButton);
		
		logsPanel.add(new JScrollPane(m_logsList), BorderLayout.CENTER);
		logsPanel.add(logsButtons, BorderLayout.SOUTH);
		

		// Build input panel
		m_inputText = new JTextArea(EMPTY_INPUT_TEXT);
		m_inputText.setEditable(true);

		// If input box still contains the default text then automatically
		// select it all (so it can easily be overwritten) when control gets
		// focus.
		m_inputText.addFocusListener(new FocusAdapter() {
			public void  focusGained(FocusEvent evt) {   
				if (m_inputText.getText().equals(EMPTY_INPUT_TEXT))
					m_inputText.selectAll();
			}
		});

		obfButtons.add(deobfButton);
		
		obfPanel.add(new JScrollPane(m_inputText), BorderLayout.CENTER);
		obfPanel.add(obfButtons, BorderLayout.SOUTH);
		obfPanel.setPreferredSize(new Dimension(200,200));
		

		// Build output panel
		m_outputText = new JTextArea(EMPTY_OUTPUT_TEXT);
		m_outputText.setEditable(false);
		deobfPanel.add(new JScrollPane(m_outputText), BorderLayout.CENTER);
		deobfPanel.add(new JLabel(ABOUT_TEXT), BorderLayout.SOUTH);
		deobfPanel.setPreferredSize(new Dimension(500,200));
		
		// Add panels to frame
		JSplitPane sp1 = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, logsPanel, obfPanel);
		JSplitPane sp2 = new JSplitPane(JSplitPane.VERTICAL_SPLIT, sp1, deobfPanel);
		getContentPane().add(sp2);

		// Add Drag n Drop support for JOBE files list
		new FileDrop(m_logsList, new FileDrop.Listener() {
			public void  filesDropped(java.io.File[] files) {   
				for (File jobelog : files) {
					loadJOBELog(jobelog);
				}
			}
		});
		
		updateLogsListData();	
		
		this.pack();
		
	}

	
	public void updateLogsListData() {
		
		Vector<File> files = m_deobfuscator.getLogs();
		
		if (files == null || files.size() < 1) {
			//String[] emptyData = new String[] {EMPTY_LOGS_LIST_TEXT};
			m_logsList.setListData(new String[] {EMPTY_LOGS_LIST_TEXT});
		} else {
			m_logsList.setListData(files);
		}
		
		doDeobfuscate();
		
		m_logsList.repaint();
	}

	
	public void loadJOBELog(File jobelog) {

		if (!jobelog.canRead()) {
			JOptionPane.showMessageDialog(this, "File " + jobelog.getAbsolutePath()
					+ " not found, or not readable",
					"Error", JOptionPane.ERROR_MESSAGE);
			return;
		}

		// Check whether user wants to clear existing obfuscation log(s) before loading new log
		if (m_deobfuscator.getLogs().size() > 0) {
			int response = JOptionPane.showConfirmDialog(DeobfuscateFrame.this, "Clear existing obfuscation info first?", "Clear JOBE logs", JOptionPane.YES_NO_OPTION);
			
			if (response == JOptionPane.YES_OPTION) {
				m_deobfuscator.reset();
			}						
		}
			
		setWaitCursor(true);
		
		try {
			
			m_deobfuscator.loadJOBELog(jobelog);
			
		} catch (Exception e) {
			JOptionPane.showMessageDialog(this, "File " + jobelog.getAbsolutePath()
					+ " not found, or not readable",
					"Error", JOptionPane.ERROR_MESSAGE);
			System.err.println("Error while processing " + jobelog.getAbsolutePath() + " - " + e);

			e.printStackTrace();
		}
		
		updateLogsListData();
		
		setWaitCursor(false);
		
	}
	
	
	public void doDeobfuscate() {
		
		Vector<File> files = m_deobfuscator.getLogs();
		
		if (files == null || files.size() < 1) {
			m_outputText.setText("<no obfuscation info available>");
			m_outputText.setEnabled(false);
			return;
		}

		String input = m_inputText.getText();
		
		if (input == null || input.length() < 1 || input.equals(EMPTY_INPUT_TEXT)) {
			m_outputText.setText(EMPTY_OUTPUT_TEXT);
			m_outputText.setEnabled(false);
			return;
		}
		
		StringBuffer output = new StringBuffer();
		
		try {
			BufferedReader inputReader;
			inputReader = new BufferedReader(new StringReader(m_inputText.getText()));

			String currline = inputReader.readLine();

			while (currline != null) {
				output.append(m_deobfuscator.deobfuscateLine(currline) + "\n");
				currline = inputReader.readLine();
			}
		} catch (java.io.IOException ioe) {
			output.append("\nError while deobfuscating: " + ioe);
			ioe.printStackTrace();
		}
		
		m_outputText.setText(output.toString());
		m_outputText.setEnabled(true);
		m_outputText.select(0, 0);
		
	}
	

    private void setWaitCursor(boolean on) {
    	
    	Component glassPane = getGlassPane();
    	
        if (on) {
            glassPane.setCursor(WAIT_CURSOR);
            glassPane.addMouseListener(nullMouseAdapter);
            glassPane.setVisible(true);
        } else {
            glassPane.setCursor(DEFAULT_CURSOR);
            glassPane.removeMouseListener(nullMouseAdapter);
            glassPane.setVisible(false);
        }
    }
    
    
	class LogJOBELogAction extends AbstractAction {
		
		private File lastDir = null;
		
		public LogJOBELogAction() {
			super("Load JOBE Log");
		}

		public void actionPerformed(ActionEvent evt) {
			
			if (m_deobfuscator == null) return;

			JFileChooser chooser = new JFileChooser();
			if (lastDir != null) chooser.setCurrentDirectory(lastDir);
			
			int option = chooser.showOpenDialog(DeobfuscateFrame.this);
			if (option == JFileChooser.APPROVE_OPTION) {
				System.out.println("Read thread dump from " + chooser.getSelectedFile());
				java.io.File jobelog = chooser.getSelectedFile();
				if (jobelog != null) {
					loadJOBELog(jobelog);
					lastDir = jobelog.getParentFile();
				}
			}
			
			
		}
		
	}
	
	
    class ClearObfInfoAction extends AbstractAction {
		
		public ClearObfInfoAction() {
			super("Clear");
		}

		public void actionPerformed(ActionEvent evt) {
			m_deobfuscator.reset();
			updateLogsListData();
		}
		
	}
	
	class DeobfuscateAction extends AbstractAction {
		
		public DeobfuscateAction() {
			super("Deobfuscate");
		}

		public void actionPerformed(ActionEvent evt) {
			doDeobfuscate();
		}
		
	}
}
