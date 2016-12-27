package pbm.debugutil.gui;

import java.awt.Rectangle;

import pbm.debugutil.MatchedThreadGroup;
import pbm.debugutil.ThreadDump;

/**
 * Holds information about the GUI state associated with a thread dump,
 * e.g. selected thread group, thread, etc...
 * 
 * This is so that when we switch to a different dump (tab) and back again we
 * can restore the previous view we had in this for this dump.
 */
public class ThreadDumpDisplayInfo {
	
	private String m_name;
	private ThreadDump m_dump;
	private MatchedThreadGroup m_selectedGroup ;
	private int m_selectedGroupIdx;
	private int m_selectedThreadIdx;
	private Rectangle m_visibileGroupsRect;
	private Rectangle m_visibileThreadsRect;

	public ThreadDumpDisplayInfo(String name, ThreadDump dump) {
		m_name = name;
		m_dump = dump;
		
		reset();
	}
	
	public void reset() {
		m_selectedGroup = null;
		m_selectedGroupIdx = -1;	
		m_selectedThreadIdx = -1;
		m_visibileGroupsRect = null;
		m_visibileThreadsRect = null;		
	}		
	
	public String getName() {
		return m_name;
	}
	
	public ThreadDump getThreadDump() {
		return m_dump;
	}

	public void setSelectedThreadGroup(MatchedThreadGroup group) {
		m_selectedGroup = group;
	}

	public MatchedThreadGroup getSelectedThreadGroup() {
		return m_selectedGroup;
	}

	public void setSelectedGroupIndex(int index) {
		m_selectedGroupIdx = index;
	}

	public int getSelectedGroupIndex() {
		return m_selectedGroupIdx;
	}
	
	public void setGroupsScrollRect(Rectangle rect) {
		m_visibileGroupsRect = rect;
	}

	public Rectangle getGroupsScrollRect() {
		return m_visibileGroupsRect;
	}

	public void setSelectedThreadIndex(int index) {
		m_selectedThreadIdx = index;
	}
	
	public int getSelectedThreadIndex() {
		return m_selectedThreadIdx;
	}
	
	public void setThreadsScrollRect(Rectangle rect) {
		m_visibileThreadsRect = rect;
	}

	public Rectangle getThreadsScrollRect() {
		return m_visibileThreadsRect;
	}

}
