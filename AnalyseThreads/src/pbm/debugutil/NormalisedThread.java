package pbm.debugutil;

public class NormalisedThread extends CommonThread {

	public NormalisedThread(CommonThread t) {
		super();
		
		m_name = Util.computeThreadGroupName(t.m_name);
//		if (name == null) System.err.println("computeThreadGroupName returned null!! - " + t.m_name);
//		m_name = (name == null) ? t.m_name : name;
		
		m_state = t.m_state;
		
		for (String stackentry : t.m_stack) {
			if (stackentry.startsWith("at ")) {				
				// AIX (IBM) thread dumps use '/' to separate packages in stack,
				// e.g. java/lang/Object.wait(...) - replace with '.' for
				// consistency with Sun thread dumps 
				this.addToStack(stackentry.replace('/', '.'));
			}
		}

	}
	
	public boolean equals(NormalisedThread t) {
		
		if (!t.m_name.equals(this.m_name)) return false;

		if (t.m_state != this.m_state) return false;
		
		if (t.m_stack.size() != this.m_stack.size()) return false;
		
		for (int i = 0; i < this.m_stack.size(); i++) {
			if (!t.m_stack.get(i).equals(this.m_stack.get(i)))
				return false;
		}
		
		return true;
	}

}
