package pbm.debugutil.gui;

import java.awt.Color;
import java.awt.Component;
import java.awt.Graphics;

import javax.swing.DefaultListCellRenderer;
import javax.swing.Icon;
import javax.swing.JLabel;
import javax.swing.JList;

import pbm.debugutil.CommonThread;
import pbm.debugutil.MatchedThreadGroup;

@SuppressWarnings("serial")
public class ATThreadGroupCellRenderer extends DefaultListCellRenderer {
	
	private static Color GOOD_THREAD_COLOR = new Color(40, 200, 40);	
	
	public ATThreadGroupCellRenderer() {
		super();
	}

	public Component getListCellRendererComponent(JList list, Object value, int index, boolean isSelected, boolean cellHasFocus) {
		super.getListCellRendererComponent(list, value, index, isSelected, cellHasFocus);
		
		if (value instanceof MatchedThreadGroup) {
			
			MatchedThreadGroup tg = (MatchedThreadGroup)value;
			
	    	String listEntry = tg.getNormalisedThread().getName();
	    	int matchcount = tg.getRawThreads().size();
	    	if (matchcount == 1)
	    		listEntry += " (1 match)";
	    	else
	    		listEntry += " (" + matchcount + " matches)";			

			setHorizontalTextPosition(JLabel.RIGHT);
			setIconTextGap(5);
			
			setIcon(ThreadStateIcon.getThreadStateIcon(tg.getNormalisedThread().getState()));
			setText(listEntry);
			
			if (tg.isGoodThread())
				setForeground(GOOD_THREAD_COLOR);
		}
		return this;
	}
	
}


class ThreadStateIcon implements Icon {
	
	private static Color THREAD_STATE_UNKNOWN_COLOR = new Color(230, 230, 230);
	private static Color THREAD_STATE_BLOCKED_COLOR = new Color(230, 120, 120);
	private static Color THREAD_STATE_WAITING_COLOR = new Color(240, 220, 0);
	private static Color THREAD_STATE_SLEEPING_COLOR = new Color(80, 80, 230);
	private static Color THREAD_STATE_RUNNABLE_COLOR = new Color(80, 210, 80);
	
	private static int WIDTH = 7;
	private static int HEIGHT = 7;
	private static int MARGIN = 3;
	
	
	private CommonThread.ThreadState state;
	
	public ThreadStateIcon (CommonThread.ThreadState state) {
		this.state = state;
	}

	public int getIconHeight() {
		return HEIGHT;
	}

	public int getIconWidth() {
		return WIDTH + MARGIN;
	}

	public void paintIcon(Component c, Graphics g, int x, int y) {
		
		switch (state) {
			case BLOCKED:
				g.setColor(THREAD_STATE_BLOCKED_COLOR);
				break;
			case WAITING:
				g.setColor(THREAD_STATE_WAITING_COLOR);
				break;
			case SLEEPING:
				g.setColor(THREAD_STATE_SLEEPING_COLOR);
				break;
			case RUNNABLE:
				g.setColor(THREAD_STATE_RUNNABLE_COLOR);
				break;
			default:
				g.setColor(THREAD_STATE_UNKNOWN_COLOR);
		}
		
		g.fillRect(MARGIN + x, y, WIDTH - 1, HEIGHT - 1);
	}
	
	
	private static ThreadStateIcon s_threadStateIcons[];
	
	public static ThreadStateIcon getThreadStateIcon(CommonThread.ThreadState state) {
		
		// Build static array of icon instances if needed
		if (s_threadStateIcons == null) {
			s_threadStateIcons = new ThreadStateIcon[CommonThread.ThreadState.values().length];
			for (CommonThread.ThreadState s : CommonThread.ThreadState.values())
				s_threadStateIcons[s.ordinal()] = new ThreadStateIcon(s);
		}
		
		if (state != null)
			return s_threadStateIcons[state.ordinal()];
		else
			return s_threadStateIcons[CommonThread.ThreadState.UNKNOWN.ordinal()];
	}
	
}