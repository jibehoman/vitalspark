package pbm.debugutil;

import java.io.PrintStream;
import java.util.LinkedList;

import pbm.debugutil.deobf.DeobfuscateManager;

public class CommonThread {
	
	public enum ThreadState { UNKNOWN, BLOCKED, WAITING, SLEEPING, RUNNABLE, NATIVE};

	protected String m_name;
	protected ThreadState m_state;
	protected LinkedList<String> m_stack;
	protected LinkedList<String> m_deobfstack;
	

	protected CommonThread () {
		this(null);
	}
	
	protected CommonThread (String name) {
		m_name = name;
		m_stack = new LinkedList<String>();
		m_deobfstack = null;
		m_state = CommonThread.ThreadState.UNKNOWN;
	}
	
	public String getName() {
		return m_name;
	}
	
	public void setName(String name) {
		m_name = name;
	}
	
	public ThreadState getState() {
		return m_state;
	}

	public void setState(ThreadState m_state) {
		this.m_state = m_state;
	}	
	
	public void addToStack(String stackline) {
		m_stack.add(stackline);
	}
	
	public LinkedList<String> getStack() {
		return m_stack;
	}

	public void generateDeobfuscatedStack(DeobfuscateManager m_deobfuscator) {
		
		if (m_deobfuscator == null) {
			m_deobfstack = null;
			return;
		}
		
		m_deobfstack = new LinkedList<String>();
		
		for (String stackline : m_stack) {
			m_deobfstack.add(m_deobfuscator.deobfuscateLine(stackline));
		}
		
	}
	
	public LinkedList<String> getDeobfuscatedStack() {
		return (m_deobfstack == null) ? m_stack : m_deobfstack;
	}
	
	
	public void printThread(PrintStream outstream) {
		outstream.println("    " + m_name + " [:" + m_state + ":]");
		
		for (String stackline : getDeobfuscatedStack()) {
			outstream.println("      " + stackline);
		}
	}

}
