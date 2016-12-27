package pbm.debugutil;

import java.io.PrintStream;
import java.util.Collection;
import java.util.Date;
import java.util.LinkedList;
import java.util.HashMap;
import java.util.Collections;

import pbm.debugutil.deobf.DeobfuscateManager;

public class ThreadDump {

	private Date m_timestamp = null;
	private HashMap<String, RawThread> m_rawThreads;  // Keyed on 'tid'
	private LinkedList<MatchedThreadGroup> m_matchedThreads;
	
	public ThreadDump() {
		m_rawThreads = new HashMap<String, RawThread>();
		m_matchedThreads = new LinkedList<MatchedThreadGroup>();
	}
	
	/**
	 * @return Timestamp associated with thread dump, or null if no timestamp available
	 */
	public Date getTimeStamp()
	{
		return m_timestamp;
	}
	
	public void setTimeStamp(Date timestamp)
	{
		m_timestamp = timestamp;
	}
	
	public void addRawThread(RawThread thread, long linenum) {
		if (m_rawThreads.containsKey(thread.getTid()))
			System.err.println("Warning: a thread with id '" + thread.getTid() + "' already exists - information from earlier thread will be lost (at line " + linenum + ")");
		
		m_rawThreads.put(thread.getTid(), thread);
	}
	
	public void computeMatches() {
		
		m_matchedThreads.clear();
		
		for (RawThread raw : m_rawThreads.values()) {

			//System.out.println("Matching: " + raw.getName());		
			
			NormalisedThread normalised = new NormalisedThread(raw);
			
			//System.out.println("  normalised name: " + normalised.getName());
			
			MatchedThreadGroup group = null;

			for (MatchedThreadGroup matched : m_matchedThreads) {
				if (matched.getNormalisedThread().equals(normalised)) {
					group = matched;
					//System.out.println("  found existing match");
					break;
				}
			}
					
			if (group == null) {
					group = new MatchedThreadGroup(normalised);
					m_matchedThreads.add(group);
					//System.out.println("  not matched - created new group");
			}

			group.addMatchedThread(raw);

		}
	}

	public int getThreadCount() {
		return m_rawThreads.size();
	}
	
	public Collection<RawThread> getRawThreads() {
	    return m_rawThreads.values();
	}
	
	public RawThread getRawThreadByID(String tid) {
		return m_rawThreads.get(tid);
	}
	
	public LinkedList<MatchedThreadGroup> getMatchedThreads() {
		java.util.LinkedList<MatchedThreadGroup> result = new java.util.LinkedList<MatchedThreadGroup>(m_matchedThreads);
//	    Collections.sort(result, ThreadGroupComparator.getSimple());
		return result;
	}
	
	public void updateKnownThreadInfo(KnownThreadsManager knownThreads) {
		for (MatchedThreadGroup tg : m_matchedThreads) {
			tg.setGoodThread(knownThreads.findMatch(tg.getNormalisedThread()) != null);
		}			
	}
	
	
	public void processDeobfuscation(DeobfuscateManager m_deobfuscator) {

		for (CommonThread t : m_rawThreads.values()) {
			t.generateDeobfuscatedStack(m_deobfuscator);
		}
		
		for (MatchedThreadGroup tg : m_matchedThreads) {
			tg.getNormalisedThread().generateDeobfuscatedStack(m_deobfuscator);
		}		
		
	}	
	
	public void displayMatchesSummary(PrintStream outstream) {

		outstream.println("Found " + m_matchedThreads.size() + " unique threads/stacks");

		// Create a copy of m_matchedThreads, sorted alphabetically by thread name 
		java.util.LinkedList<MatchedThreadGroup> sortedThreadGroups = new java.util.LinkedList<MatchedThreadGroup>(m_matchedThreads);
	    Collections.sort(sortedThreadGroups, ThreadGroupComparator.getSimple());
				
		for (MatchedThreadGroup group : sortedThreadGroups) {
			outstream.print("  Group - " + group.getNormalisedThread().getName());
			outstream.println(" - " + group.getRawThreads().size() + " matches");
		}
	}

	
	public void displayMatchesDetail(PrintStream outstream) {
		outstream.println("Found " + m_matchedThreads.size() + " unique threads/stacks");

	    // Create a copy of m_matchedThreads, sorted alphabetically by thread name 
		java.util.LinkedList<MatchedThreadGroup> sortedThreadGroups = new java.util.LinkedList<MatchedThreadGroup>(m_matchedThreads);
	    Collections.sort(sortedThreadGroups, ThreadGroupComparator.getSimple());		
		
		for (MatchedThreadGroup group : sortedThreadGroups) {
			outstream.println("\n  Group - " + group.getNormalisedThread().getName());
			outstream.println("    " + group.getRawThreads().size() + " matches");
			
			for (RawThread raw : group.getRawThreads()) {
				outstream.println("    " + raw.getTitle());				
			}
			
			outstream.println("  Normalised stack:");
			group.getNormalisedThread().printThread(outstream);
		}
	}

}
