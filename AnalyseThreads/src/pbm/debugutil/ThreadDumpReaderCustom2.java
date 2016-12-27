package pbm.debugutil;

import java.util.LinkedList;
import java.util.List;

/*
 * Full thread dump Java HotSpot(TM) Server VM (1.5.0_17-b04 mixed mode):
 * 
 * "AgentSender of XOnceClientContextWrapper for BaseClientContext 5428662731693621248::CERNER-MK017554  DEV  08-28-2009 16-26-48  C cff4d14cb02cc10a-d3047da-12362e746e5--7ffc$CONNECTION$" - Thread t@138735
 *    java.lang.Thread.State: TIMED_WAITING on java.lang.Object@958fe
 *         at java.lang.Object.wait(Native Method)
 *         at progress.message.broker.AgentSender.threadMain(AgentSender.java:944)
 *         at progress.message.zclient.DebugThread.run(DebugThread.java:256)
 * 
 * "AgentListener of ClientContext 5428662731693621248::CERNER-MK017554  DEV  08-28-2009 16-26-48  C cff4d14cb02cc10a-d3047da-12362e746e5--7ffc$CONNECTION$" - Thread t@138736
 *    java.lang.Thread.State: RUNNABLE
 *         at java.net.SocketInputStream.socketRead0(Native Method)
 *         at java.net.SocketInputStream.read(SocketInputStream.java:129)
 *         ...
 */

public class ThreadDumpReaderCustom2 extends ThreadDumpReader {

	public static final String THREAD_DUMP_HEADER = "Full thread dump Java";
    public static final String THREAD_STATE_LABEL = "java.lang.Thread.State: ";
	public static final String SYNCHRONIZERS_HEADER = "Locked ownable synchronizers:";
	public static final String SYNCHRONIZERS_NONE = "\t- None";
	
	
	public ThreadDumpReaderCustom2() {
		super("X02", "Custom Reader (jvisualvm)");
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
                

				// Expect line starting with a double-quote and including " - Thread t@"
                if (line.charAt(0) != '\"')
                    break;
                if (line.indexOf(" - Thread t@") < 2)
                    break;

                // Check next line starts with "java.lang.Thread.State:".  If so, the
                // dump is probably in the right format
                line = reader.getNextLine();
                if (line.trim().startsWith(THREAD_STATE_LABEL)) {
                    result = true;
                    break;
                }

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
            
            line = reader.getNextLine();
            setThreadState(thread, line.trim());
            
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
	// "AgentListener of ClientContext 2039391353822280788:USMDLSSVCW315:Broker" Id=434 in RUNNABLE (running in native)
	// "AgentSender of NeighborClientContext wrapper for: BaseClientContext 2039391353821988112:USMDLSSVCW311:Broker" Id=358 in TIMED_WAITING on lock=java.lang.Object@2f2087	
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
	
		int tidStartPos = title.indexOf(" - Thread t@");
		if (tidStartPos > 0) {
			tidStartPos += 12;  // skip over ' - Thread t@' itself
			id = title.substring(tidStartPos);	
		}
	
		RawThread thread = new RawThread(title, name, id);
		
		return thread;
		
	}
	
	private void setThreadState(RawThread thread, String stateLine) throws UnexpectedFormatException {
	    
	    if (!stateLine.startsWith(THREAD_STATE_LABEL)) {
            throw new UnexpectedFormatException("Expected " + THREAD_STATE_LABEL + ", instead got: " + stateLine);           	        
	    }
	    
	    // Determine thread state
        if (stateLine.indexOf(": TIMED_WAITING") > 0){
            thread.setState(CommonThread.ThreadState.WAITING);
        } else if (stateLine.indexOf(": WAITING") > 0) {
            thread.setState(CommonThread.ThreadState.WAITING);
        } else if (stateLine.indexOf(": BLOCKED") > 0) {
            thread.setState(CommonThread.ThreadState.BLOCKED);
        } else if (stateLine.indexOf(": RUNNABLE") > 0) {
            thread.setState(CommonThread.ThreadState.RUNNABLE);
        } else {
            System.err.println("Warning: Unrecognised thread state in line '" + stateLine + "'");
        }	    
	}

}
