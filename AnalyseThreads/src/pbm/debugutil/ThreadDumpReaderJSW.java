package pbm.debugutil;

import java.util.List;

/*
 * Reads Sun thread dumps from Java Service Wrapper (http://wrapper.tanukisoftware.com) logs.
 * Lines in these logs have a Java Service Wrapper prefix that needs stripping out.
 * 
 *   STATUS | wrapper  | 2010/11/16 11:24:06 | Dumping JVM state.
 *   INFO   | jvm 1    | 2010/11/16 11:24:06 | Full thread dump Java HotSpot(TM) Server VM (1.5.0_15-b04 mixed mode):
 *   INFO   | jvm 1    | 2010/11/16 11:24:06 | 
 *   INFO   | jvm 1    | 2010/11/16 11:24:06 | "EventLogTheadPool-1291" prio=6 tid=0x4e716e28 nid=0x8b8 in Object.wait() [0x50eff000..0x50effd9c]
 *   INFO   | jvm 1    | 2010/11/16 11:24:06 | 	at java.lang.Object.wait(Native Method)
 *   
 * This class is simply a wrapper around ThreadDumpReaderSun that uses JavaServiceWrapperReader
 * in place of SimpleReader.
 */
public class ThreadDumpReaderJSW extends ThreadDumpReader {
	
	public ThreadDumpReaderJSW()
	{
		super("JSW", "Java Service Wrapper Thread Dump Reader");
	}
	
	@Override
	protected boolean testFormatImpl(LogReader reader) throws Exception {
		boolean result = false;
		
		String line = reader.getNextLine();
        
		// Look for a line starting with the Java Service Wrapper's JVM prefix
		while (line != null) {
				
			if (line.startsWith(JavaServiceWrapperReader.JVM_PREFIX))
			{
				result = true;
				break;
			}
				
			line = reader.getNextLine();
        	
		}
				
		return result;	
	}
	
	@Override
	protected List<ThreadDump> readThreadDumpsImpl(LogReader reader)
			throws Exception {
		JavaServiceWrapperReader jswReader = new JavaServiceWrapperReader((SimpleReader)reader);
		ThreadDumpReaderSun sunDumpReader = new ThreadDumpReaderSun();
		return sunDumpReader.readThreadDumps(jswReader);
	}

}
