package pbm.debugutil;

import java.io.IOException;

public interface LogReader {

	public String getName();

	public String getPath();

	public String getNextLine() throws IOException;

	public String getCurrentLine();

	public long getLineNum();

	public void reset();

	public void close();

}