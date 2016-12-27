package pbm.debugutil.gui;

import java.awt.Color;
import java.awt.Component;
import java.awt.Font;
import java.awt.Graphics;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import javax.swing.Icon;
import javax.swing.JTable;
import javax.swing.ListSelectionModel;
import javax.swing.RowSorter;
import javax.swing.SortOrder;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.TableRowSorter;

import pbm.debugutil.CommonThread;
import pbm.debugutil.MatchedThreadGroup;
import pbm.debugutil.CommonThread.ThreadState;

@SuppressWarnings("serial")
public class ATThreadGroupsTable extends JTable {
	
	ATThreadGroupsTable(ATThreadGroupsTableModel model) {
		super(model);
		setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
		setColumnSelectionAllowed(false);
		setAutoCreateRowSorter(true);
		
		setGridColor(Color.lightGray);
		
		// Column widths
		getColumnModel().getColumn(0).setPreferredWidth(10);
		getColumnModel().getColumn(1).setPreferredWidth(500);
		getColumnModel().getColumn(2).setPreferredWidth(20);
		getColumnModel().getColumn(3).setPreferredWidth(20);
		
		// Custom renders
		getColumnModel().getColumn(0).setCellRenderer(new StateRenderer());
		getColumnModel().getColumn(1).setCellRenderer(new ThreadGroupRenderer());

		// Default sort by thread name
		TableRowSorter sorter = (TableRowSorter)getRowSorter();
		sorter.setComparator(1, new ThreadGroupComparator());		
		List <RowSorter.SortKey> sortKeys = new ArrayList<RowSorter.SortKey>();
		sortKeys.add(new RowSorter.SortKey(1, SortOrder.ASCENDING));
		sorter.setSortKeys(sortKeys);	
	}
	


/*    // Extend JTable to provide ToopTips for description column (allowing full description to be seen if it's truncated)
    public String getToolTipText(MouseEvent e) {
        String tip = null;
        java.awt.Point p = e.getPoint();
        int rowIndex = rowAtPoint(p);
        int colIndex = columnAtPoint(p);
        int realColumnIndex = convertColumnIndexToModel(colIndex);

        if (realColumnIndex == 1) {  // Thread name
            tip = (String)(getValueAt(rowIndex, colIndex));
        } else {
            //You can omit this part if you know you don't
            //have any renderers that supply their own tool
            //tips.
            tip = super.getToolTipText(e);
        }
        return tip;
    }*/

	
	// Displays icon (coloured box) representing state
	static class StateRenderer extends DefaultTableCellRenderer {
		
	    public StateRenderer() {
	    	super();
	    }

	    public void setValue(Object value) {
	    	if (value instanceof ThreadState)
	    	{
	    		ThreadState state = (ThreadState)value;
	    		setText(null);
	    		setIcon(ThreadStateIcon.getThreadStateIcon(state));
	    		setHorizontalAlignment(CENTER);
	    	}
	    }
	}
	
	// Bold text, coloured according to whether or not the thread is 'expected' 
	static class ThreadGroupRenderer extends DefaultTableCellRenderer {
		
		private static Color GOOD_THREAD_COLOR = new Color(40, 200, 40);	
		
		// Cache BOLD version of default font
		Font m_font = null;
		
	    public ThreadGroupRenderer() {
	    	super();
	    }

	    public void setValue(Object value) {
	    	if (value instanceof MatchedThreadGroup)
	    	{
	    		MatchedThreadGroup tg = (MatchedThreadGroup)value;
		    	String listEntry = tg.getNormalisedThread().getName();
		    	int matchcount = tg.getRawThreads().size();
		    	if (matchcount == 1)
		    		listEntry += " (1 match)";
		    	else
		    		listEntry += " (" + matchcount + " matches)";			

	    		if (m_font == null)
	    			m_font = getFont().deriveFont(Font.BOLD);
		    			    	
				setFont(m_font);
				setText(listEntry);
				
				if (tg.isGoodThread())
					setForeground(GOOD_THREAD_COLOR);
				else
					setForeground(Color.black);
	    	}
	    }
	}

	static class ThreadGroupComparator implements Comparator<MatchedThreadGroup> {

		public int compare(MatchedThreadGroup arg0, MatchedThreadGroup arg1) {
			String tname0 = arg0.getNormalisedThread().getName();
			String tname1 = arg1.getNormalisedThread().getName();
		
			return tname0.compareTo(tname1);
		}
	}

		
	static class ThreadStateIcon implements Icon {
		
		private static Color THREAD_STATE_UNKNOWN_COLOR = new Color(230, 230, 230);
		private static Color THREAD_STATE_BLOCKED_COLOR = new Color(230, 120, 120);
		private static Color THREAD_STATE_WAITING_COLOR = new Color(240, 220, 0);
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
				case WAITING:
					g.setColor(THREAD_STATE_WAITING_COLOR);
					break;
				case BLOCKED:
					g.setColor(THREAD_STATE_BLOCKED_COLOR);
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
	
}


