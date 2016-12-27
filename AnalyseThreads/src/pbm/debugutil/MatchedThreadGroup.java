package pbm.debugutil;

import java.util.LinkedList;

public class MatchedThreadGroup {
	
  private LinkedList<RawThread> m_matchedRawThreads;
  private NormalisedThread m_normalisedThread;
  
  private boolean m_isGoodThread = false;
  

  public MatchedThreadGroup(NormalisedThread thread) {
	  m_normalisedThread = thread;
	  m_matchedRawThreads = new LinkedList<RawThread>();
  }
  
  public void addMatchedThread(RawThread thread) {
	  m_matchedRawThreads.add(thread);
  }

  public NormalisedThread getNormalisedThread() {
	return m_normalisedThread;
  }

  public LinkedList<RawThread> getRawThreads() {
	  return m_matchedRawThreads;
  }
  
  public boolean isGoodThread() {
    return m_isGoodThread;
  }

  public void setGoodThread(boolean isGoodThread) {
    m_isGoodThread = isGoodThread;
  }  
  
}
