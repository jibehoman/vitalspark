package pbm.debugutil.gui;

import java.util.*;
import java.util.prefs.*;


/**
*
* <p>Title: PreferenceManager</p>
* <p>Description: Singleton class to manage the User Preferences feature.</p>
* <p>Copyright: Copyright (c) 2002 Sonic Software Corporation. All Rights Reserved.</p>
* <p>Stolen by Paul Meadows from SMC implementation :)</p>
* @author Charlie Cocchiaro
* @version 1.0
*/

public class PreferenceManager {

	    private static PreferenceManager _instance = null;
	    private HashMap<String, Preferences> m_nodeMap = new HashMap<String, Preferences>();
	    private Preferences m_root;

	    /**
	     * Static method to create a single instance of this class.
	     *
	     * @returns An instance of this class
	     */
	    public static PreferenceManager getInstance()
	    {
	        if (_instance == null)
	            _instance = new PreferenceManager();

	        return _instance;
	    }

	    /**
	     * Default constructor called by the public static method to create a single
	     * instance of this class.
	     */
	    private PreferenceManager()
	    {
	        m_root = Preferences.userNodeForPackage(this.getClass());
	    }

	    public void resetUserPreferences()
	    {
	        try
	        {
	            m_root.removeNode();
	            m_root = Preferences.userNodeForPackage(this.getClass());
	            m_nodeMap = new HashMap<String, Preferences>();
	        }
	        catch(Exception e)
	        {
				System.err.println("PreferenceManager: Failed to reset User Preferences");
				e.printStackTrace();
	        }
	        return;
	    }

	    public String getString(String path, String name, String defVal)
	    {
	        Preferences node = findNode(path);

	        return (node != null) ? node.get(createPreferredKey(name), defVal) : null;
	    }

	    public boolean getBoolean(String path, String name, boolean defVal)
	    {
	        Preferences node = findNode(path);

	        return (node != null) ? node.getBoolean(createPreferredKey(name), defVal) : defVal;
	    }

	    public int getInt(String path, String name, int defVal)
	    {
	        Preferences node = findNode(path);

	        return (node != null) ? node.getInt(createPreferredKey(name), defVal) : defVal;
	    }

	    public void setBoolean(String path, String name, boolean value, boolean flush)
	    {
	        Preferences node = findNode(path);

	        if (node != null)
	        {
	            node.putBoolean(createPreferredKey(name), value);

	            if (flush)
	                flush(node);
	        }
	    }

	    public void setInt(String path, String name, int value, boolean flush)
	    {
	        Preferences node = findNode(path);

	        if (node != null)
	        {
	            node.putInt(createPreferredKey(name), value);

	            if (flush)
	                flush(node);
	        }
	    }

	    public void setString(String path, String name, String value, boolean flush)
	    {
	        Preferences node = findNode(path);

	        if (node != null)
	        {
	            node.put(createPreferredKey(name), value);

	            if (flush)
	                flush(node);
	        }
	    }

	    public void remove(String path, String name, boolean flush)
	    {
	        Preferences node = findNode(path);

	        if ((node != null) && (node.get(createPreferredKey(name), null) != null))
	        {
	            node.remove(name);

	            if (flush)
	                flush(node);
	        }
	    }

	    public void flush()
	    {
	        flush(m_root);
	    }

	    public void flush(String path)
	    {
	        flush(findNode(path));
	    }

	    public String[] getChildrenNames(String path)
	    {
	        try
	        {
	            Preferences node = findNode(path);

	            return node.childrenNames();
	        }
	        catch(Exception e)
	        {
				System.err.println("PreferenceManager: Failed to get children names: " + path);
				e.printStackTrace();
	        }
	        return null;
	    }

	    public void removeNode(String path)
	    {
	        try
	        {
	            Preferences node = findNode(path);

	            node.removeNode();
	        }
	        catch(Exception e)
	        {
				System.err.println("PreferenceManager: Failed to remove node: " + path);
				e.printStackTrace();
	        }
	    }

	    private void flush(Preferences node)
	    {
	        try
	        {
	            node.flush();
	        }
	        catch (BackingStoreException e)
	        {
//	            MgmtConsole.getMgmtConsole().notifyMessage(MgmtConsole.MESSAGE_ERROR,
//	                                        "Failed to flush preferences", e, true);
				System.err.println("PreferenceManager: Failed to flush preferences");
				e.printStackTrace();
	        }
	    }

	    private String createPreferredKey(String strKeyName)
	    {
	        // ensure key is no longer than 80 characters, as per Preferences......
	        if (strKeyName != null && strKeyName.length() > Preferences.MAX_KEY_LENGTH)
	        {
	            strKeyName = strKeyName.substring(strKeyName.length() - Preferences.MAX_KEY_LENGTH, strKeyName.length());
	        }

	        return strKeyName;
	    }

	    private synchronized Preferences findNode(String path)
	    {
	        String pathPreferred = createPreferredKey(path);
	        Preferences node = m_nodeMap.get(pathPreferred);

	        if(node == null)
	        {
	            // replace all occurences of . with / in the path
	            node = m_root.node(pathPreferred.replace('.', '/'));

	            m_nodeMap.put(pathPreferred, node);
	        }
	        return node;
	    }

}
