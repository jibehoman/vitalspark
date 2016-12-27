package pbm.debugutil;

import java.util.Comparator;

// Two modes are available - simple or filter.  In 'simple' mode a simple string
// comparison if done on the thread name.  In 'filter' mode, recognised 'good' threads
// are pushed to the end of sort, helping to highlight threads in unrecognised states 
public class ThreadGroupComparator implements Comparator<MatchedThreadGroup> {

	// Handles on singleton instances of the simple and filtered comparators
	private static ThreadGroupComparator s_tgcSimple;
	private static ThreadGroupComparator s_tgcFiltered;
	
	private boolean m_applyFilter;
	
	private ThreadGroupComparator (boolean applyFilter) {
		m_applyFilter = applyFilter;
	}

	public int compare(MatchedThreadGroup arg0, MatchedThreadGroup arg1) {
		if (m_applyFilter) {
			if (arg0.isGoodThread() && !arg1.isGoodThread()) return 1;
			if (!arg0.isGoodThread() && arg1.isGoodThread()) return -1;
		}
		
		String tname0 = arg0.getNormalisedThread().getName();
		String tname1 = arg1.getNormalisedThread().getName();
		
		return tname0.compareTo(tname1);
	}

	public static ThreadGroupComparator getSimple() {
		if (s_tgcSimple == null) s_tgcSimple = new ThreadGroupComparator(false);
		return s_tgcSimple;
	}
	
	public static ThreadGroupComparator getFiltered() {
		if (s_tgcFiltered == null) s_tgcFiltered = new ThreadGroupComparator(true);
		return s_tgcFiltered;
	}	

}
