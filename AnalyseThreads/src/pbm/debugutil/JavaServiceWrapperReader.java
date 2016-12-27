package pbm.debugutil;

import java.io.IOException;

/*
 * Wrapper around SimpleReader that strips out the prefix inserted by the
 * Java Service Wrapper (http://wrapper.tanukisoftware.com).  Here's a
 * sample of the log style:
 * 
 *   STATUS | wrapper  | 2010/11/16 11:24:06 | Dumping JVM state.
 *   INFO   | jvm 1    | 2010/11/16 11:24:06 | Full thread dump Java HotSpot(TM) Server VM (1.5.0_15-b04 mixed mode):
 *   INFO   | jvm 1    | 2010/11/16 11:24:06 | 
 *   INFO   | jvm 1    | 2010/11/16 11:24:06 | "EventLogTheadPool-1291" prio=6 tid=0x4e716e28 nid=0x8b8 in Object.wait() [0x50eff000..0x50effd9c]
 *   INFO   | jvm 1    | 2010/11/16 11:24:06 | 	at java.lang.Object.wait(Native Method)
 *   
 * This is a basic initial implementation currently.  It returns only lines with
 * the "INFO | jvm " prefix and assumes a fixed length for the overall prefix
 * (which includes the timestamp).  We can make it more intelligent later.
 */
public class JavaServiceWrapperReader implements LogReader {
	
	public static final String JVM_PREFIX = "INFO   | jvm ";
    private static final int JVM_PREFIX_LEN = "INFO   | jvm 1    | 2010/11/16 11:24:06 | ".length(); 
	
	SimpleReader m_reader;
	String m_currentLine;
	
	public JavaServiceWrapperReader(SimpleReader reader)
	{
		m_reader = reader;
		reset();
	}

	public void close() {
		m_reader.close();
	}

	public String getCurrentLine() {
		return m_currentLine;
	}

	public long getLineNum() {
		return m_reader.getLineNum();
	}

	public String getName() {
		return m_reader.getName();
	}

	public String getNextLine() throws IOException {
		String line = "";
		
		while (line != null && !line.startsWith(JVM_PREFIX))
			line = m_reader.getNextLine();
		
		if (line != null)
		{
			if (line.length() > JVM_PREFIX_LEN)
				line = line.substring(JVM_PREFIX_LEN);
			else if (line.length() == JVM_PREFIX_LEN)
				line = "";
		}
		
		m_currentLine = line;
		return m_currentLine;
	}

	public String getPath() {
		return m_reader.getPath();
	}

	public void reset() {
		m_reader.reset();
		m_currentLine = m_reader.getCurrentLine();
	}

}
