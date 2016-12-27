package pbm.debugutil;

import java.util.LinkedList;
import java.util.List;

public class ThreadDumpReaderCustom1 extends ThreadDumpReader {

	public static final String THREAD_DUMP_HEADER = "Full Java thread dump";
	
	
	public ThreadDumpReaderCustom1() {
		super("X01", "Custom Reader (Mercury JMX utility)");
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

				// Expect "Total threads" after THREAD_DUMP_HEADER
				// Could also check for the next line starting with a quote
				result = line.startsWith("Total threads");
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
		
		if (!line.startsWith("Total threads ")) {
			throw new UnexpectedFormatException("Expected 'Total threads ', found: '" + Util.truncateString(line, 34) + "'");
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
	
		int tidStartPos = title.indexOf(" Id=");
		if (tidStartPos > 0) {
			tidStartPos += 4;  // skip over ' Id=' itself
			int tidEndPos = title.indexOf(' ', tidStartPos);
			if (tidEndPos > tidStartPos)
				id = title.substring(tidStartPos, tidEndPos);	
			else
				throw new UnexpectedFormatException("Expected space (' ') after thread id: 'tid=<value> ...'." +
						"Check for spurious line breaks in thread dump?");
			
		}
	
		RawThread thread = new RawThread(title, name, id);
		
		// Determine thread state
		if (title.contains(" in TIMED_WAITING")){
			thread.setState(CommonThread.ThreadState.WAITING);
		} else if (title.contains(" in WAITING")) {
			thread.setState(CommonThread.ThreadState.WAITING);
		} else if (title.contains(" in BLOCKED")) {
			thread.setState(CommonThread.ThreadState.BLOCKED);
		} else if (title.contains(" in RUNNABLE")) {
			thread.setState(CommonThread.ThreadState.RUNNABLE);
		} else {
			System.err.println("Warning: Unable to determine thread state for thread '" + title + "'");
		}
		
		return thread;
		
	}

}
