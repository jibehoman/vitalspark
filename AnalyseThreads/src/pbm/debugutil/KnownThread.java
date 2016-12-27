package pbm.debugutil;

import java.util.LinkedList;

public class KnownThread extends CommonThread implements Comparable<KnownThread> {

	public KnownThread (String header) throws UnexpectedFormatException {
		super();
		
		if (header.endsWith(":]")) {
			int splitpoint = header.lastIndexOf(" [:");
			if (splitpoint < 1 || splitpoint > header.length() - 6) {
				throw new UnexpectedFormatException("Expected '<thread name> [:<state:]', instead found '" + header + "'");
			}
			
			m_name = header.substring(0, splitpoint);
			
			String stateName = header.substring(splitpoint + 3, header.length() - 2);

			m_state = CommonThread.ThreadState.valueOf(stateName);

			if (m_state == null)
				throw new UnexpectedFormatException("Thread state '" + stateName + "' unrecognised.  Thread '" + m_name + "'");
			
			
		} else {
			m_name = header;
			m_state = ThreadState.UNKNOWN;
		}
		
	}	

	public KnownThread (CommonThread t) {
		super(t.m_name);
		
		this.m_state = t.m_state;

//		for (String stackentry : t.m_stack) {
		for (String stackentry : t.getDeobfuscatedStack()) {
			if (stackentry.startsWith("at "))
				this.addToStack(stackentry);
		}		
	}	
	
	// Strip source file/line info' before adding line to stack,
	// e.g. strip parenthesis from end of line:
	//   at java.lang.Object.wait(Object.java:429)
	public void addToStack(String stackline) {		
		m_stack.add(stripSourceInfo(stackline));
	}
	
	protected String stripSourceInfo(String stackline) {
		String result = stackline.trim();
		int idx = result.indexOf('(');
		if (idx > 0) result = result.substring(0, idx);
		return result;
	}

	// Used to sort known threads by thread name
	public int compareTo(KnownThread obj) {
		return m_name.compareTo(obj.m_name);
	}
	
	// Tests whether the given thread 't' matches this thread.  The boolean flag
	// 'includeThreadState' determines whether the thread state should be included
	// as part of the comparison.  There may be cases where the thread state
	// information is unrecognised or unreliable and the user therefore wishes
	// to omit it from the comparison, relying instead only on the thread's name
	// and stack
	public boolean matches(NormalisedThread t, boolean includeThreadName, boolean includeThreadState) {

		// Check thread names match
		if (includeThreadName && (!t.m_name.equals(this.m_name))) return false;
		
		// Check thread states match (iff 'includeThreadState' is true) 
		if (includeThreadState && (t.m_state != this.m_state)) return false;
		
		// Check stacks match
		LinkedList<String> compareToStack = t.getDeobfuscatedStack(); 
		
		if (compareToStack.size() != this.m_stack.size()) return false;
		
		for (int i = 0; i < this.m_stack.size(); i++) {
			if (!stripSourceInfo(compareToStack.get(i)).equals(this.m_stack.get(i)))
				return false;
		}
		
		return true;
		
	}
	
}
