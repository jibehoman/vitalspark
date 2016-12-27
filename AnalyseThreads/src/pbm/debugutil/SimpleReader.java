package pbm.debugutil;

import java.io.BufferedReader;
import java.io.EOFException;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.StringReader;

public class SimpleReader implements LogReader {

	private File m_file = null;
	private String m_string = null;
	
	private String m_name;

	private BufferedReader m_reader = null;
	private String m_currentLine;
	private long m_linenum;
	private boolean m_closed = false;
	
	public SimpleReader (File infile) {
		m_file = infile;
		m_name = infile.getName();
		reset();
	}
	
	public SimpleReader (String instring, String name) {
		m_string = instring;
		m_name = name;
		reset();
	}	
	
	public String getName() {
		return m_name;
	}	

	public String getPath() {
		if (m_file != null)
			return m_file.getPath();
		else
			return m_name;
	}	
	
	public String getNextLine() throws IOException {

		if (m_reader == null) initReader();
		
		try {
			m_currentLine = m_reader.readLine();
			m_linenum++;
		} catch (EOFException eof) {
			m_currentLine = null;
		}
        
		// Debug
		//System.out.println("  ::" + m_currentLine);
		
		return m_currentLine;
	}
	
	public String getCurrentLine() {
		return m_currentLine;
	}
	
	public long getLineNum() {
		return m_linenum;
	}	
	
	public void reset() {
		// Close existing BufferedReader so a new one is created the next time getNextLine() is called 
		if (m_reader != null) {
			try { m_reader.close(); } catch (IOException e) { }
			m_reader = null;
		}
		m_currentLine = "{Call getNextLine() first}";
		m_linenum = 0;		
	}
	
	public void close() {
		try {
			m_reader.close();
		} catch (IOException e) { }
		
		m_file = null;
		m_string = null;
		
		m_currentLine = "{SimpleReader is closed!}";
		m_linenum = -1;	
		m_closed = true;
	}

	
	private void initReader() throws IOException {
		if (m_closed)
			throw new IOException("SimpleReader has previously been closed");
		
		if (m_file != null)
			m_reader = new BufferedReader(new FileReader(m_file));
		else if (m_string != null)
			m_reader = new BufferedReader(new StringReader(m_string));
		else
			throw new IOException("SimpleReader not properly initialized");
		
		m_currentLine = "{Call getNextLine() first}";
		m_linenum = 0;		
	}

}
