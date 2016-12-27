package pbm.debugutil;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

/*
 * Thread 14746: (state = BLOCKED)
 *  - java.lang.Object.wait(long) @bci=0 (Compiled frame; information may be imprecise)
 *  - progress.message.broker.AgentSender.threadMain() @bci=326, line=1068 (Interpreted frame)
 *  - progress.message.zclient.DebugThread.run() @bci=9, line=226 (Compiled frame)
 *
 * Locked ownable synchronizers:
 *     - None
 *
 * Thread 14745: (state = IN_NATIVE)
 *  - java.net.SocketInputStream.socketRead0(java.io.FileDescriptor, byte[], int, int, int) @bci=0 (Compiled frame; information may be imprecise)
 *  - java.net.SocketInputStream.read(byte[], int, int) @bci=84, line=129 (Compiled frame)
 * ...
 */
public class ThreadDumpReaderJStackF extends ThreadDumpReader {
    
    public static final String DEADLOCK_HEADER = "Deadlock Detection:";
    public static final String THREAD_PREFIX = "Thread ";
	public static final String SYNCHRONIZERS_HEADER = "Locked ownable synchronizers:";
	public static final String SYNCHRONIZERS_NONE = "- None";
	
	
	public ThreadDumpReaderJStackF() {
		super("JSF", "Sun 'jstack' Dumps Taken With '-F' Flag (unsupported)");
	}

	
	protected boolean testFormatImpl(LogReader reader)
	throws Exception {

		boolean result = false;
		
		String line = reader.getNextLine();
        
		// Look for a line formatted "Thread XXXXX: (state = XXXX)", followed by a line starting " - "
		while (line != null) {
				
			if (line.startsWith(THREAD_PREFIX)) {

			    if (line.indexOf(": (state = ") > 0 && line.endsWith(")"))
			    {
			        result = true;
			        break;
			    }
			}
				
            line = reader.getNextLine();
		}
		
		// Check next line starts with " - "
/* seeing some cases or "Error occurred during stack walking:" after Thread title line, so skip this check
 		if (result)
		{
            line = reader.getNextLine();
            result = line.startsWith(" - ");
		}
*/		
				
		return result;			
	}
	
	
	protected List<ThreadDump> readThreadDumpsImpl(LogReader reader)
	throws Exception {
		
		List<ThreadDump> threadDumps = new LinkedList<ThreadDump>();
		
		//String prevLine = "";
		String line = reader.getNextLine();
        
		while (line != null) {
				
			if (line.startsWith(THREAD_PREFIX)) {
				System.out.println("Found thread dump starting at line " + reader.getLineNum());
				ThreadDump dump = readThreadDump(reader);
				threadDumps.add(dump);
				line = reader.getCurrentLine();  // Refresh current line since ThreadDump.readFromFile() will have updated it	
			} else {
				//prevLine = line;
				line = reader.getNextLine();
			}
        	
		}
        
		return threadDumps;
	}
	

	private ThreadDump readThreadDump(LogReader reader) throws Exception {

		ThreadDump threadDump = new ThreadDump();
		
		String line = reader.getCurrentLine();
		
		if (!line.startsWith(THREAD_PREFIX)) {
			throw new UnexpectedFormatException("Expected '" + THREAD_PREFIX + "', found: '" + Util.truncateString(line, 34) + "'");
		}
		
		while (line != null) {
			
			// Skip blank lines
			if (line.length() == 0) {
				line = reader.getNextLine();
				continue;
			}
			
			if (!line.startsWith(THREAD_PREFIX)) break;  // Expecting a thread title line, if not, then break out (assume end of current thread dump)
			
			RawThread thread = createThread(line);
			
			boolean cont = true;
			while (cont) {
				line = reader.getNextLine();
				if (line != null && line.trim().length() > 0) {
				    String stackline = line;
				    if (line.startsWith(" - "))
				        stackline = line.substring(3);
					thread.addToStack("at " + stackline.trim());
				} else {
					cont = false;
				}
			}
			
			// Check for 'Locked ownable synchronizers' section
			if (line != null && line.length() == 0)	line = reader.getNextLine();  // skip blank line
			if (line != null && line.trim().equals(SYNCHRONIZERS_HEADER)) {
				line = reader.getNextLine();
				if (SYNCHRONIZERS_NONE.equals(line.trim())) {
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
	// Thread 14746: (state = BLOCKED)
	private RawThread createThread(String title) throws UnexpectedFormatException {

		String name;
		String id = "n/a";

		if (!title.startsWith(THREAD_PREFIX))
            throw new UnexpectedFormatException("Expected '" + THREAD_PREFIX + "', found: '" + Util.truncateString(title, 34) + "'");
	
		int nameEndPos = title.indexOf(':', 0);
	
		if (nameEndPos < 2) 
			throw new UnexpectedFormatException("Expected ':' after thread id, " +
					"instead got: " + title);			
	
		name = title.substring(0, nameEndPos);
		id = title.substring(THREAD_PREFIX.length(), nameEndPos);
	
		RawThread thread = new RawThread(title, name, id);
		
		// Determine thread state
		if (title.contains("(state = BLOCKED)")){
			thread.setState(CommonThread.ThreadState.BLOCKED);
		} else if (title.contains("(state = IN_NATIVE)")) {
			thread.setState(CommonThread.ThreadState.NATIVE);
		} else {
			System.err.println("Warning: Unable to determine thread state for thread '" + title + "'");
		}
		
		return thread;
		
	}

}
