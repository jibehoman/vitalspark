package pbm.debugutil;

import java.util.List;

public abstract class ThreadDumpReader {

	String short_name;
	String name;
	
	ThreadDumpReader(String short_name, String name) {
		this.short_name = short_name;
		this.name = name;
	}

	// Tests whether the given file should be handled by this ThreadDumpReader
	public boolean testFormat(LogReader reader){
		try {
			reader.reset();
			return testFormatImpl(reader);
		} catch (Exception e) {
			System.err.println("Failure while testing log against format (" + getName() + ")");
			if (reader != null) {
				System.err.print(", at line " + reader.getLineNum());
			}
			System.err.println("...");
			e.printStackTrace();			
		}
		return false;		
	}

	// Reads thread dumps from the supplied file
	public List<ThreadDump> readThreadDumps(LogReader reader) {
		try {
			reader.reset();
			return readThreadDumpsImpl(reader);
		} catch (Exception e) {
			System.err.println("Failure while parsing log, format (" + getName() + ")");
			if (reader != null) {
				System.err.print(", at line " + reader.getLineNum());
			}
			System.err.println("...");
			e.printStackTrace();
		}	
		return null;
	}

	// Tests whether the given file should be handled by this ThreadDumpReader
	protected abstract boolean testFormatImpl(LogReader reader)
	throws Exception;

	// Reads thread dumps from the supplied file
	protected abstract List<ThreadDump> readThreadDumpsImpl(LogReader reader)
	throws Exception;
	
	public String getShortName() {
		return short_name;
	}	
	
	public String getName() {
		return name;
	}
	
}
