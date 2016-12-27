package pbm.debugutil.gui;

import java.awt.BorderLayout;
import java.awt.Color;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;

import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.text.BadLocationException;
import javax.swing.text.DefaultHighlighter;
import javax.swing.text.Highlighter.HighlightPainter;

import pbm.debugutil.AnalyseThreadsGUI;
import pbm.debugutil.RawThread;
import pbm.debugutil.ThreadDump;

@SuppressWarnings("serial")
public class ATRawThreadsPane extends JPanel implements PropertyChangeListener {
    
    private static final Color highlightColor = new Color(255, 200, 230);

    private AnalyseThreadsGUI m_app;    

    private JTextArea m_stackDisplay;
    private JScrollPane m_scrollPane;
	
    private HighlightPainter m_highlightPainer = new DefaultHighlighter.DefaultHighlightPainter(highlightColor); 

    
	public ATRawThreadsPane() {
		super();
		
		m_app = AnalyseThreadsGUI.getInstance();
		
	    setLayout(new BorderLayout());

		add(new javax.swing.JLabel("Raw Stacks"), BorderLayout.NORTH);

		m_stackDisplay = new JTextArea();
		m_stackDisplay.setEditable(false);
		m_scrollPane = new JScrollPane(m_stackDisplay);
		add(m_scrollPane, BorderLayout.CENTER);
		
		// Listen for changes to selected thread id
		AnalyseThreadsGUI.getInstance().addPropertyChangeListener(this);		
	}

	private void threadChanged(String threadId) {

		if (threadId == null || threadId.length() < 1) {
			m_stackDisplay.setText(null);
			return;
		}
		
		StringBuffer text = new StringBuffer(); 

		int i = 0;
		for (ThreadDump td : m_app.getAnalyser().getThreadDumps()) {
		    i++;
		    if (i > 1) text.append("\n\n");
		    RawThread rt = td.getRawThreadByID(threadId);
		    
		    text.append("Dump " + i + " : ");
		    
		    if (rt == null) {
		    	text.append("<not present>");
		    } else {
			    text.append(rt.getTitle());
			    for (String s : rt.getDeobfuscatedStack()) {
			    	text.append("\n    " + s);
			    }		    	
		    }

		}
		
		m_stackDisplay.setText(text.toString());
		m_stackDisplay.setSelectionStart(0);
		m_stackDisplay.setSelectionEnd(0);
		
		addSearchHighlights();
	}
	
	public void propertyChange(PropertyChangeEvent evt) {
		if (evt.getPropertyName() == AnalyseThreadsGUI.SELECTED_THREAD_ID_PROPERTY) {
			String threadId = (String)evt.getNewValue();
			threadChanged(threadId);
		}
	}
	
	private void addSearchHighlights() {
	    String displayText = m_stackDisplay.getText();
	    String searchString = m_app.getSearchString();
	    if (displayText == null || searchString == null) return;
	    
	    int startIdx = 0;
	    while (true) {
	        startIdx = displayText.indexOf(searchString, startIdx);
	        if (startIdx < 0) break;
	        
	        int endIdx = startIdx + searchString.length();
	        try {
	            m_stackDisplay.getHighlighter().addHighlight(startIdx, endIdx, m_highlightPainer);
	        } catch (BadLocationException e) {}	        
	        
	        startIdx = endIdx;  // continue searching from end of current selection
	    }
	}

}
