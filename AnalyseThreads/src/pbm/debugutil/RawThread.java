package pbm.debugutil;

public class RawThread extends CommonThread {
	
	protected String m_title;
	protected String m_tid;

	public RawThread(String title, String name, String id) {
		super();
		
		m_title = title;
		m_name = name;
		m_tid = id;

		if (AnalyseThreads.DEBUG)
		{
			System.out.println("  thread: " + m_title);
			//System.out.println("    name: " + m_name);
			//System.out.println("     tid: " + m_tid);	
		}
	}
	
	public String getTid() {
		return m_tid;
	}


	public String getTitle() {
		return m_title;
	}

}
