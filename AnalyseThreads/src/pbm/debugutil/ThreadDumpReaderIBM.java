package pbm.debugutil;

import java.util.LinkedList;
import java.util.List;

public class ThreadDumpReaderIBM extends ThreadDumpReader {

	public static final String THREAD_DUMP_MARKER = "2XMFULLTHDDUMP";
	public static final String THREAD_TITLE_MARKER = "3XMTHREADINFO";
    public static final String THREAD_EXTRA_INFO_MARKER = "3XMTHREADINFO1";
	public static final String STACK_FRAME_MARKER = "4XESTACKTRACE";

	public static final int STACK_FRAME_MARKER_LENGTH = STACK_FRAME_MARKER.length() + 1;  // '+ 1' added to allow for THREAD_EXTRA_INFO_MARKER
	
	
	public ThreadDumpReaderIBM() {
		super("IBM", "IBM Javacore Reader");
	}

	
	protected boolean testFormatImpl(LogReader reader)
	throws Exception {

		boolean result = false;
		
		// For now, just check that the first two lines start with
		// 'NULL' and 'OSECTION' respectively.  This will probably need
		// some refinement
		String line = reader.getNextLine();
		if (line.startsWith("NULL           -----")) {
			line = reader.getNextLine();
			if (line.startsWith("0SECTION       TITLE")) result = true;
		}
			
		return result;			
	}

	
	protected List<ThreadDump> readThreadDumpsImpl(LogReader reader)
	throws Exception {	

		List<ThreadDump> threadDumps = new LinkedList<ThreadDump>();
		
		String line = reader.getNextLine();
        
		while (line != null) {
				
			if (line.startsWith(THREAD_DUMP_MARKER)) {
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
		
		String line = reader.getNextLine();
		
		if (!line.startsWith(THREAD_TITLE_MARKER)) {
			throw new UnexpectedFormatException("Expected '" + THREAD_TITLE_MARKER + "', found: '" + Util.truncateString(line, 34) + "'");
		}
		
		while (line != null) {
			
//			if (!line.startsWith(THREAD_TITLE_MARKER)) break;  // Expecting a thread title line, if not, then break out (assume end of current thread dump)
			
			// Expecting a thread title line, if not, continue scanning dump anyway.
			// We're only expecting one thread dump per javacore file, so if we find
			// further threads they'll be associated with this same thread dump.
			// Javacore (from AIX?) may contain native stack entries that we want to
			// ignore without assuming we've reached the end of the thread dump, e.g.:
			//   3XMTHREADINFO      "Container State Poll Thread" (TID:0x7000000000B5948, sys_thread_t:0x11592EEC8, state:CW, native ID:0x2324) prio=5
		    //   3XMTHREADINFO1            (native thread ID:0xC76D1482, native priority:0x5, native policy:UNKNOWN)
			//   4XESTACKTRACE          at java.lang.Object.wait(Native Method)
			//   4XESTACKTRACE          at com.sonicsw.mf.comm.jms.DurableConnector.publish(DurableConnector.java(Compiled Code))
			//   ...
			//   4XESTACKTRACE          at com.sonicsw.mf.framework.manager.DomainStateMonitor$WorkerThread.run(DomainStateMonitor.java:716)
			//   3XHNATIVESTACK       Native Stack
			//   NULL                 ------------
			//   3XHSTACKLINE         at 0x900000000433B24 in _cond_wait_local
			//   3XHSTACKLINE         at 0x900000000433FD0 in _cond_wait
			//   ...
			//   3XHSTACKLINE         at 0x112BCB13C in 
			//   4XMNATIVESTCKEX**** Exception 2 received when dumping native stack.
			//   3XMTHREADINFO      "Container State Poll Thread" (TID:0x7000000000B59E8, sys_thread_t:0x11570F2C8, state:CW, native ID:0x2223) prio=5
			//   4XESTACKTRACE          at java.lang.Object.wait(Native Method)
			//   4XESTACKTRACE          at com.sonicsw.mf.comm.jms.DurableConnector.publish(DurableConnector.java(Compiled Code))
			//   ...
			if (!line.startsWith(THREAD_TITLE_MARKER)) {
				line = reader.getNextLine();
				continue;  
			}
			
			RawThread thread = createThread(line);
			
			boolean cont = true;
			while (cont) {
				line = reader.getNextLine();
				if (line != null && line.trim().length() > 0 && (line.startsWith(STACK_FRAME_MARKER) || line.startsWith(THREAD_EXTRA_INFO_MARKER))) {
					thread.addToStack(line.substring(STACK_FRAME_MARKER_LENGTH).trim());
				} else {
					cont = false;
				}
			}
			
			threadDump.addRawThread(thread, reader.getLineNum());
			
		}
		
		return threadDump;
		
	}
	
	
	
	// Parse thread title of following form:
	// 3XMTHREADINFO      "Task Runner 1030276868 [idle]" (TID:0x104740F0, sys_thread_t:0x6C6D1E8, state:CW, native ID:0xF40) prio=5
	// extracting thread name and tid.  RawThread object with this info'
	private RawThread createThread(String line) throws UnexpectedFormatException {

		String title;
		String name;
		String id = "n/a";

		if (!line.startsWith(THREAD_TITLE_MARKER))
			throw new UnexpectedFormatException("Thread title expected to start with " + THREAD_TITLE_MARKER + ", " +
					"instead found: '" + Util.truncateString(line, 28) + "'");
			
		int titleStartPos = line.indexOf('\"');
			
		if (titleStartPos < 0)
			throw new UnexpectedFormatException("Thread title expected to start with double-quote (\"), " +
					"instead found: " + line.substring(0, 20) + "...");
	
		title = line.substring(titleStartPos);
		
		int nameEndPos = title.indexOf('\"', 1);
	
		if (nameEndPos < 2) 
			throw new UnexpectedFormatException("Expected thread name surrounded in double-quotes (\"), " +
					"instead got: " + title);			
	
		name = title.substring(1, nameEndPos);
	
		int tidStartPos = title.indexOf("TID:");
		if (tidStartPos > 0) {
			tidStartPos += 4;  // skip over 'TID:' itself
			id = getAlphaNumSubstring(title.substring(tidStartPos));	
		}
		
		// Append nid to internal tid if possible to help prevent false matches
		// due to tids being reused
		int nidStartPos = title.indexOf("native ID:");
		if (nidStartPos > 0) {
			nidStartPos += 10;  // skip over 'native ID:' itself
			id += "-" + getAlphaNumSubstring(title.substring(nidStartPos));	
		}
		
		RawThread thread = new RawThread(title, name, id);
		
		// Determine thread state
        /* 
           From http://publib.boulder.ibm.com/infocenter/realtime/v1r0/index.jsp?topic=/com.ibm.rt.doc.10/diag/tools/javadump_tags_threads.html:
           This may be just be info' for the Windows CE JVM?  (RealTime??) - found when researching Cerner issue

           The values of state can be:

           * R - Runnable - the thread is able to run when given the chance.
           * CW - Condition Wait - the thread is waiting. For example, because:
                 o A sleep() call is made
                 o The thread has been blocked for I/O
                 o A wait() method is called to wait on a monitor being notified
                 o The thread is synchronizing with another thread with a join() call
           * S – Suspended – the thread has been suspended by another thread.
           * Z – Zombie – the thread has been killed.
           * P – Parked – the thread has been parked by the new concurrency API (java.util.concurrent).
           * B – Blocked – the thread is waiting to obtain a lock that something else currently owns.
		*/
		if (title.contains(", state:CW")){
			thread.setState(CommonThread.ThreadState.WAITING);
		} else if (title.contains(", state:MW")) {  // Deprecated?  (not listed above)
			thread.setState(CommonThread.ThreadState.BLOCKED);
        } else if (title.contains(", state:B")) {
            thread.setState(CommonThread.ThreadState.BLOCKED);
		} else if (title.contains(", state:R")) {
			thread.setState(CommonThread.ThreadState.RUNNABLE);
		} else {
			System.err.println("Warning: Unable to determine thread state for thread '" + title + "'");
		}
		
		return thread;
		
	}
	
	// Returns the first part of the given string up until the first non alpha-numeric char
	private String getAlphaNumSubstring(String str) {

		if (str == null) return null;
		
		int i;
		for (i = 0; i < str.length(); i++) {
			if (!Character.isLetterOrDigit(str.charAt(i))) break;
		}
		
		return str.substring(0, i);
		
	}
	
	/* Test getAlphaNumSubstring
	public static void main(String[] args) {
		ThreadDumpReaderIBM tmp = new ThreadDumpReaderIBM();
	    System.out.println("1: " + tmp.getAlphaNumSubstring("sdjfk  fdsa"));
	    System.out.println("1: " + tmp.getAlphaNumSubstring("sdjfk,fdsa"));
	    System.out.println("1: " + tmp.getAlphaNumSubstring("sdjfk)fdsa"));
	    System.out.println("2: " + tmp.getAlphaNumSubstring("sd123s"));
	    System.out.println("3: " + tmp.getAlphaNumSubstring(""));
	}
	*/

}
