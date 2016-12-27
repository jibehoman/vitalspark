package pbm.debugutil;

@SuppressWarnings("serial")
public class AnalyseThreadsException extends Exception {

	public AnalyseThreadsException() {
		super();
	}

	public AnalyseThreadsException(String message) {
		super(message);
	}

	public AnalyseThreadsException(String message, Throwable linkedException) {
		super(message, linkedException);
	}

	public AnalyseThreadsException(Throwable message) {
		super(message);
	}

}
