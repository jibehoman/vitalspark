package pbm.debugutil;

import java.util.LinkedList;
import java.util.List;

/*
Reader for SDF thread dumps from Sonic 7.x.  The format has changed
for 8.0 (see ThreadDumpReaderSDF) - adding in lock info' etc...

This is similar to the Sun thread dump reader.  The differences at present
are:
  
  - the THREAD_DUMP_HEADER
  - the 'tid' format
  - the absence of 'at ' prefixing the stack frames

    ** Full thread dump:

	"TxThread RequestThread10" prio=5 tid=<0x3e> state=WAITING)
		java.lang.Object.wait(Native Method)
		java.lang.Object.wait(Object.java:474)
		progress.message.broker.TransactionMgr.nextAsyncOp(TransactionMgr.java:3538)
		progress.message.broker.TransactionMgr.access$300(TransactionMgr.java:48)

It may make sense to merge SDF support into ThreadDumpReaderSun since
they're pretty similar at present, but for now I've kept them separate, partly
because the SDF format may change a little at first.

'Blocked' threads can include information about the lock the thread is trying to
acquire.  These are prefixed with '- ' and are not part of the stack, e.g.:
 
    "JMS Session Delivery Thread", daemon prio=5 tid=<0x39> state=BLOCKED
        net.sourceforge.jtds.jdbc.ConnectionJDBC2.prepareCall(ConnectionJDBC2.java:2300)
        - waiting on <0x2e> (a progress.message.jimpl.Session$SessionThread) to release net.sourceforge.jtds.jdbc.ConnectionJDBC3@766f05d9
        net.sourceforge.jtds.jdbc.ConnectionJDBC2.prepareCall(ConnectionJDBC2.java:2292)
        nnavailabilitycache.NNDSLAvailabilityGetCacheTdcInfoImpl.getCachedTdcInfoByPhoneNumber(NNDSLAvailabilityGetCacheTdcInfoImpl.java:61)
*/


public class ThreadDumpReaderSDF7x extends ThreadDumpReader {

	public static final String THREAD_DUMP_HEADER = "** Full thread dump:";
	
	
	public ThreadDumpReaderSDF7x() {
		super("SDF7x", "Sonic Diagnostic Framework Thread Dump Reader (Sonic 7.x)");
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
		
		String line = reader.getNextLine();
        
		while (line != null) {
				
			if (line.startsWith(THREAD_DUMP_HEADER)) {
				System.out.println("Found thread dump starting at line " + reader.getLineNum());
				threadDumps.add(readThreadDump(reader));
				line = reader.getCurrentLine();  // Refresh current line since ThreadDump.readFromFile() will have updated it	
			} else {
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
		
	}
	

	// Parse thread title of following form:
	// "RMDispatchThread 1", daemon prio=5 tid=<0x76> state=WAITING
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
	
		int tidStartPos = title.indexOf("tid=<");
		if (tidStartPos > 0) {
			tidStartPos += 5;  // skip over 'tid=<' itself
			int tidEndPos = title.indexOf('>', tidStartPos);
			if (tidEndPos > tidStartPos)
				id = title.substring(tidStartPos, tidEndPos);	
			else
				throw new UnexpectedFormatException("Expected greater-than symbol ('>') after thread id: 'tid=<value>'." +
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
