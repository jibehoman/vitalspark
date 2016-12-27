package pbm.debugutil;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

public class ThreadDumpReaderSun extends ThreadDumpReader {

	public static final String THREAD_DUMP_HEADER = "Full thread dump ";
	public static final String SYNCHRONIZERS_HEADER = "Locked ownable synchronizers:";
	public static final String SYNCHRONIZERS_NONE = "\t- None";
	
	
    private static final String TIMESTAMP_FORMAT_STRING = "yyyy-MM-dd HH:mm:ss"; // e.g. 2010-05-07 16:11:17	
    private static final SimpleDateFormat TIMESTAMP_FORMAT = new SimpleDateFormat(TIMESTAMP_FORMAT_STRING); // e.g. 2010-05-07 16:11:17	
    private static final int TIMESTAMP_FORMAT_LENGTH = TIMESTAMP_FORMAT_STRING.length(); // e.g. 2010-05-07 16:11:17	
	
	
	public ThreadDumpReaderSun() {
		super("Sun", "Sun Console Thread Dump Reader");
	}

	
	protected boolean testFormatImpl(LogReader reader)
	throws Exception {

		boolean result = false;
		
		String line = reader.getNextLine();
        
		// Look for a line starting with the THREAD_DUMP_HEADER, then check
		// the next (or next but one) line starts with a double-quote (")
		while (line != null) {
				
			if (line.startsWith(THREAD_DUMP_HEADER)) {
					
				line = reader.getNextLine();

				// Skip on to the next line if current line is blank
				if (line.trim().length() == 0) line = reader.getNextLine();
					result = line.startsWith("\"");
					break;
			}
				
			line = reader.getNextLine();
        	
		}
				
		return result;			
	}
	
	
	protected List<ThreadDump> readThreadDumpsImpl(LogReader reader)
	throws Exception {
		
		List<ThreadDump> threadDumps = new LinkedList<ThreadDump>();
		
		String prevLine = "";
		String line = reader.getNextLine();
        
		while (line != null) {
				
			if (line.startsWith(THREAD_DUMP_HEADER)) {
				
				// Look for date in previous line (1.6 VMs): e.g. "2010-05-07 16:11:17"
				Date timestamp = null;
				try
				{
				    if (prevLine.length() == TIMESTAMP_FORMAT_LENGTH)
				    	timestamp = TIMESTAMP_FORMAT.parse(prevLine);
				}
				catch (Throwable t)
				{
					// Do nothing - many thread dumps won't have timestamps
				}
				
				
				System.out.println("Found thread dump starting at line " + reader.getLineNum());
				ThreadDump dump = readThreadDump(reader);
				dump.setTimeStamp(timestamp);
				threadDumps.add(dump);
				line = reader.getCurrentLine();  // Refresh current line since ThreadDump.readFromFile() will have updated it	
			} else {
				prevLine = line;
				line = reader.getNextLine();
			}
        	
		}
        
		return threadDumps;
	}
	

	private ThreadDump readThreadDump(LogReader reader) throws Exception {

		ThreadDump threadDump = new ThreadDump();
		
		String line = reader.getCurrentLine();
		
		if (!line.startsWith(THREAD_DUMP_HEADER)) {
			throw new UnexpectedFormatException("Expected '" + THREAD_DUMP_HEADER + "', found: '" + Util.truncateString(line, 34) + "'");
		}
		
		line = reader.getNextLine();
		
		while (line != null) {
			
			// Skip blank lines
			if (line.length() == 0) {
				line = reader.getNextLine();
				continue;
			}
			
			if (line.charAt(0) != '\"') break;  // Expecting a thread title line, if not, then break out (assume end of current thread dump)
			
			RawThread thread = createThread(line);
			
			boolean cont = true;
			while (cont) {
				line = reader.getNextLine();
				if (line != null && line.trim().length() > 0 && (line.startsWith("  ") || (line.startsWith("\t")))) {
					thread.addToStack(line.trim());
				} else {
					cont = false;
				}
			}
			
			// Check for 'Locked ownable synchronizers' section
			if (line != null && line.length() == 0)	line = reader.getNextLine();  // skip blank line
			if (line != null && line.trim().equals(SYNCHRONIZERS_HEADER)) {
				line = reader.getNextLine();
				if (SYNCHRONIZERS_NONE.equals(line)) {
					// suppress synchronizers section if empty
					line = reader.getNextLine();
				} else {
					// add synchronizers info' to stack
					thread.addToStack("");
					thread.addToStack(SYNCHRONIZERS_HEADER);
					while (line != null && line.startsWith("\t- ")) {
						thread.addToStack(line.trim());
						line = reader.getNextLine();
					}
				}
			}
			
			threadDump.addRawThread(thread, reader.getLineNum());
			
		}
		
		return threadDump;
		
	}
	

	// Parse thread title of following form:
	// "Task Runner 12604138" daemon prio=1 tid=0xd8da37f0 nid=0x38d9 in Object.wait() [d8c7e000..d8c7e86c]
	// extracting thread name and tid.  RawThread object with this info'
	private RawThread createThread(String title) throws UnexpectedFormatException {

		String name;
		String id = "n/a";

		if (title.charAt(0) != '\"')
			throw new UnexpectedFormatException("Thread title expected to start with double-quote (\"), " +
					"instead found: '" + Util.truncateString(title, 15) + "'");
	
		int nameEndPos = title.indexOf('\"', 1);
	
		if (nameEndPos < 2) 
			throw new UnexpectedFormatException("Expected thread name surrounded in double-quotes (\"), " +
					"instead got: " + title);			
	
		name = title.substring(1, nameEndPos);
	
		int tidStartPos = title.indexOf("tid=");
		if (tidStartPos > 0) {
			tidStartPos += 4;  // skip over 'tid=' itself
			int tidEndPos = title.indexOf(' ', tidStartPos);
			if (tidEndPos > tidStartPos)
				id = title.substring(tidStartPos, tidEndPos);	
			else
				throw new UnexpectedFormatException("Expected space (' ') after thread id: 'tid=<value> ...'." +
						"Check for spurious line breaks in thread dump?");
			
		}
		
		// Append nid to internal tid if possible to help prevent false matches
		// due to tids being reused
		int nidStartPos = title.indexOf("nid=");
		if (nidStartPos > 0) {
			nidStartPos += 4;  // skip over 'nid=' itself
			int nidEndPos = title.indexOf(' ', nidStartPos);
			if (nidEndPos > nidStartPos)
				id += "-" + title.substring(nidStartPos, nidEndPos);
			else
				throw new UnexpectedFormatException("Expected space (' ') after native thread id: 'nid=<value> ...'." +
						"Check for spurious line breaks in thread dump?");
		}
		
		RawThread thread = new RawThread(title, name, id);
		
		// Determine thread state
		if (title.contains(" in Object.wait()")){
			thread.setState(CommonThread.ThreadState.WAITING);
		} else if (title.contains(" waiting on condition")) {
			thread.setState(CommonThread.ThreadState.WAITING);
		} else if (title.contains(" waiting for monitor entry")) {
			thread.setState(CommonThread.ThreadState.BLOCKED);
		} else if (title.contains(" sleeping")) {
			thread.setState(CommonThread.ThreadState.SLEEPING);
		} else if (title.contains(" runnable")) {
			thread.setState(CommonThread.ThreadState.RUNNABLE);
		} else {
			System.err.println("Warning: Unable to determine thread state for thread '" + title + "'");
		}
		
		return thread;
		
	}

}
