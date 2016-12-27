package pbm.debugutil;

import java.util.LinkedList;
import java.util.List;


// Read thread dump from JDB output.  The file must contain only
// a single dump of all threads with no preceeding or additional
// text/info, e.g.:
//    LogFlushScheduler:
//	    [1] java.lang.Object.wait (native method)
//	    [2] java.lang.Object.wait (Object.java:474)
//	    [3] progress.message.broker.LogManager$FlushScheduler.run (LogManager.java:1,969)
//	    [4] java.lang.Thread.run (Thread.java:595)
//	  LogFlushThread:
//	    [1] java.lang.Object.wait (native method)
//	    [2] java.lang.Object.wait (Object.java:474)
//
// No thread id available, so thread name used as id - will cause some
// false thread matching across thread dumps (if thread names are not unique)

public class ThreadDumpReaderJDB extends ThreadDumpReader {

	public ThreadDumpReaderJDB() {
		super("JDB", "Sun JDB Thread Dump Reader (unsupported)");
	}
	

	protected boolean testFormatImpl(LogReader reader)
	throws Exception {

		boolean result = false;
		
		String line = reader.getNextLine();
        
		// First line should end with a colon (:), next line should start with
		// and open square bracket ([)
		if (line.endsWith(":")) {
			line = reader.getNextLine();
			if (line.trim().startsWith("[")) result = true;
		}
			
		return result;			
	}	


	protected List<ThreadDump> readThreadDumpsImpl(LogReader reader)
	throws Exception {
	
		List<ThreadDump> threadDumps = new LinkedList<ThreadDump>();
		
		// Preload first line
   		String line = reader.getNextLine();
   		if (line == null) throw new UnexpectedFormatException("Unable to read from file");

		threadDumps.add(readThreadDump(reader));
    		
		return threadDumps;
	}
	
	
	private ThreadDump readThreadDump(LogReader reader) throws Exception {

		ThreadDump threadDump = new ThreadDump();
		
		String line = reader.getCurrentLine();
		
		while (line != null) {
			if (!Character.isLetter(line.charAt(0)) || line.charAt(line.length() - 1) != ':')
				throw new UnexpectedFormatException("Expected thread name, starting with a letter and finishing with a colon.  Instead found '" + line + "'");
			
			String threadTitle = line.substring(0, line.length() - 1);
			RawThread thread = new RawThread(threadTitle, threadTitle, threadTitle);

			boolean cont = true;
			while (cont) {
				line = reader.getNextLine();
				if (line != null && line.trim().length() > 0 && (line.startsWith("  [") || (line.startsWith("\t[")))) {
					int idx = line.indexOf(']');
					if (idx < 2 || idx > (line.length() - 3)) throw new UnexpectedFormatException("Expected stack line prefixed with '  [<number>]'.  Instead found '" + line + "'");
					
					// Replace '  [num] ' with '  at '
					String tmp = line.substring(idx + 1);
					tmp = "at " + tmp.trim();
					
					thread.addToStack(tmp);
				} else {
					cont = false;
				}
			}
			
			threadDump.addRawThread(thread, reader.getLineNum());
			
		}
		
		return threadDump;		
		
	}
}
