package pbm.debugutil.gui;

import java.util.LinkedList;

import javax.swing.table.AbstractTableModel;

import pbm.debugutil.MatchedThreadGroup;
import pbm.debugutil.ThreadDump;
import pbm.debugutil.CommonThread.ThreadState;

@SuppressWarnings("serial")
public class ATThreadGroupsTableModel extends AbstractTableModel {
	
    final String[] columnLabels = {"State", "Name", "Expected", "Stack Depth"};
    private LinkedList<MatchedThreadGroup> m_threadGroups;

    ATThreadGroupsTableModel(ThreadDump dump) {
    	m_threadGroups = dump.getMatchedThreads();
    }
    
    public void changeThreadDump(ThreadDump dump) {
    	m_threadGroups = dump.getMatchedThreads();
    	fireTableDataChanged();
    }
    
    
	public int getColumnCount() {
		return columnLabels.length;
	}

	public int getRowCount() {
		return m_threadGroups.size();
	}

	public Object getValueAt(int row, int col) {
		MatchedThreadGroup group = m_threadGroups.get(row);
		if (group == null) return null;
		
        if (col == 0) {
        	return group.getNormalisedThread().getState();
        	//return ThreadStateIcon.getThreadStateIcon(group.getNormalisedThread().getState());
        }
        
        if (col == 1) {
        	return group;
        }
        
        if (col == 2) {
        	return group.isGoodThread();
        }
        
        if (col == 3) {
        	return group.getNormalisedThread().getStack().size();
        }
        
        return null;
	}
	
    public String getColumnName(int column) {
    	return columnLabels[column];
    }
    

    public Class<?> getColumnClass(int col) {
    	
        if (col == 0) return ThreadState.class;
        if (col == 1) return MatchedThreadGroup.class;
        if (col == 2) return Boolean.class;
        if (col == 3) return Integer.class;
        
        return null;    	
    }	

}
