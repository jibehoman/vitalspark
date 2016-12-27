package pbm.debugutil;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.LinkedList;
import java.util.List;
import java.util.TimeZone;

/*
Reader for SDF thread dumps from Sonic 8.0 and later.
 
    ========================================================================

    Instruction: jvm.threads dumpState
    Container: Sonic.Container1broker1
    Host: sonicsol12
    ...

    Dump start time: Fri Mar 12 09:44:38 EST 2010

    ------------------------------------------------------------------------

    Java Thread Dump (thread details collected in 103ms)
    "AgentSender of ClientContext -7289325435405865655:Administrator:$TMPAPPID$8$$CONNECTION$" prio=5 tid=0xd7 state=TIMED_WAITING
        at java.lang.Object.wait(Native Method)
          - waiting on java.lang.Object@11fb2e0
        at progress.message.broker.AgentSender.threadMain(AgentSender.java:989)
        at progress.message.zclient.DebugThread.run(DebugThread.java:226)
*/


public class ThreadDumpReaderSDF extends ThreadDumpReader {

	public static final String THREAD_DUMP_HEADER = "Java Thread Dump (thread details collected";

	private static final String TIMESTAMP_HEADER = "Dump start time: ";
	
//  private static final SimpleDateFormat TIMESTAMP_FORMAT = new SimpleDateFormat("EEE MMM dd HH:mm:ss zzz yyyy");
	// Kludge to prevent times getting converted to local time zone - obliterate time zone field!!
	// Though maybe this will introduce additional problems with other languages, given day/month in words not numbers?!
	// see below too
    private static final SimpleDateFormat TIMESTAMP_FORMAT = new SimpleDateFormat("EEE MMM dd HH:mm:ss     yyyy");	
		
	public ThreadDumpReaderSDF() {
		super("SDF", "Sonic Diagnostic Framework Thread Dump Reader (8.x and later)");
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
		
		Date timestamp = null;
		String line = reader.getNextLine();
        
		while (line != null) {
				
			if (line.startsWith(TIMESTAMP_HEADER)) {
				try
				{
					StringBuilder dateStr = new StringBuilder(line.substring(TIMESTAMP_HEADER.length()));
					// Kludge to prevent times getting converted to local time zone - obliterate time zone field!!
					// Though maybe this will introduce additional problems with other languages, given day/month in words not numbers?!
					// see above too
					dateStr.setCharAt(20, ' ');
					dateStr.setCharAt(21, ' ');
					dateStr.setCharAt(22, ' ');
					
					System.err.println("Parsing date: " + dateStr);
					timestamp = TIMESTAMP_FORMAT.parse(dateStr.toString());
				}
				catch (Throwable t)
				{
					timestamp = null;
					System.err.println("Error parsing thread dump timestamp at line " + reader.getLineNum() + " - timestamp ignored");
					t.printStackTrace();
				}
				line = reader.getNextLine();
			} else if (line.startsWith(THREAD_DUMP_HEADER)) {
				System.out.println("Found thread dump starting at line " + reader.getLineNum());
				ThreadDump dump = readThreadDump(reader);
				dump.setTimeStamp(timestamp);
				threadDumps.add(dump);
				line = reader.getCurrentLine();  // Refresh current line since ThreadDump.readFromFile() will have updated it	
			} else {
				line = reader.getNextLine();
			}
        	
		}
        
		return threadDumps;
	}
	

/*	private ThreadDump readThreadDump(SimpleReader reader) throws Exception {

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
				if (line != null && line.trim().length() > 0 && (line.startsWith("\t"))) {
                    // prefix stack frame with 'at ' since it's missing from the thread dump
				    // unless line starts with '- ' indicating lock-related info'.
				    String stackLine = line.trim();
				    if (!stackLine.startsWith("- "))
				        stackLine = "at " + stackLine;
					thread.addToStack(stackLine);
				} else {
					cont = false;
				}
			}
			
			threadDump.addRawThread(thread, reader.getLineNum());
			
		}
		
		return threadDump;
		
	}*/
	
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
			
			threadDump.addRawThread(thread, reader.getLineNum());
			
		}
		
		return threadDump;
		
	}	
	

	// Parse thread title of following form:
	// "SonicHttpsServer0-1" daemon prio=5 tid=0x91 state=TIMED_WAITING
	// extracting thread name, tid, and state.  RawThread object with this info'
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
		
/* No native id in SDF dumps at present...
		
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
*/		
		
		RawThread thread = new RawThread(title, name, id);
		
		// Determine thread state
		if (title.contains(" state=WAITING")){
			thread.setState(CommonThread.ThreadState.WAITING);
		} else if (title.contains(" state=TIMED_WAITING")) {
			thread.setState(CommonThread.ThreadState.WAITING);
		} else if (title.contains(" state=BLOCKED")) {
			thread.setState(CommonThread.ThreadState.BLOCKED);
        } else if (title.contains(" state=SLEEPING")) {
            thread.setState(CommonThread.ThreadState.SLEEPING);
		} else if (title.contains(" state=RUNNABLE")) {
			thread.setState(CommonThread.ThreadState.RUNNABLE);
		} else {
			System.err.println("Warning: Unable to determine thread state for thread '" + title + "'");
		}
		
		return thread;			
		
	}

}
