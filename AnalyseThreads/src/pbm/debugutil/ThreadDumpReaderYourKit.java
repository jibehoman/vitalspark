package pbm.debugutil;

import java.util.LinkedList;
import java.util.List;

/**
 * Stacks at the moment of snapshot capture Threads shown: 305 of 309
 * 
 * 
 * 
 * Action Processor tid=256 [WAITING] java.lang.Object.wait()
 * com.sonicsw.sonicmq.util.action.ActionProcessor.threadMain()
 * progress.message.zclient.DebugThread.run()
 */
public class ThreadDumpReaderYourKit extends ThreadDumpReader {

	public static final String THREAD_DUMP_HEADER = "Stacks at the moment of snapshot";

	public ThreadDumpReaderYourKit() {
		super("YKIT", "YourKit Reader");
	}

	protected boolean testFormatImpl(LogReader reader) throws Exception {

		boolean result = false;

		String line = reader.getNextLine();

		// Look for a line starting with the THREAD_DUMP_HEADER, then check
		// the next (or next but one) line starts with a double-quote (")
		while (line != null) {

			if (line.startsWith(THREAD_DUMP_HEADER)) {

				line = reader.getNextLine();
				result = true;

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
				System.out.println("Found thread dump starting at line "
						+ reader.getLineNum());
				line = reader.getNextLine();
				threadDumps.add(readThreadDump(reader));
				line = reader.getCurrentLine(); // Refresh current line since
												// ThreadDump.readFromFile()
												// will have updated it
			} else {
				line = reader.getNextLine();
			}

		}

		return threadDumps;
	}

	private ThreadDump readThreadDump(LogReader reader) throws Exception {

		ThreadDump threadDump = new ThreadDump();

		String line = reader.getCurrentLine();
		while (line != null) {

			// Skip blank lines
			if (line.length() == 0) {
				line = reader.getNextLine();
				continue;
			}

			RawThread thread = createThread(line);
			setThreadState(thread, line.trim());

			boolean cont = true;
			while (cont) {
				line = reader.getNextLine();
				if (line != null && line.trim().length() > 0) {
					thread.addToStack("at " + line.trim());
				} else {
					cont = false;
				}
			}
			threadDump.addRawThread(thread, reader.getLineNum());
		}

		return threadDump;

	}

	// Parse thread title of following form:
	// "AgentListener of ClientContext 2039391353822280788:USMDLSSVCW315:Broker"
	// Id=434 in RUNNABLE (running in native)
	// "AgentSender of NeighborClientContext wrapper for: BaseClientContext 2039391353821988112:USMDLSSVCW311:Broker"
	// Id=358 in TIMED_WAITING on lock=java.lang.Object@2f2087
	// extracting thread name and tid. RawThread object with this info'
	private RawThread createThread(String title)
			throws UnexpectedFormatException {

		String name;
		String id = "n/a";

		int tidStartPos = title.indexOf(" tid=");
		name = title.substring(0, tidStartPos);

		tidStartPos += 5; // skip over ' - tid=' itself
		id = title.substring(tidStartPos);
		id = id.substring(0, id.indexOf(" "));

		RawThread thread = new RawThread(title, name, id);

		return thread;

	}

	private void setThreadState(RawThread thread, String stateLine)
			throws UnexpectedFormatException {

		// Determine thread state
		if (stateLine.indexOf("TIMED_WAITING") > 0) {
			thread.setState(CommonThread.ThreadState.WAITING);
		} else if (stateLine.indexOf("WAITING") > 0) {
			thread.setState(CommonThread.ThreadState.WAITING);
		} else if (stateLine.indexOf("BLOCKED") > 0) {
			thread.setState(CommonThread.ThreadState.BLOCKED);
		} else if (stateLine.indexOf("RUNNABLE") > 0) {
			thread.setState(CommonThread.ThreadState.RUNNABLE);
		} else if (stateLine.indexOf("SLEEPING") > 0) {
			thread.setState(CommonThread.ThreadState.SLEEPING);
		} else {
			System.err.println("Warning: Unrecognised thread state in line '"
					+ stateLine + "'");
		}
	}

}
