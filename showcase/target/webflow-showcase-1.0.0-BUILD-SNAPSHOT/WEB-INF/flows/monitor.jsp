<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<div>
	<h2 class="alt">Monitor your applications</h2>
	<h4 class="alt"><a href="<c:url value="/"/>">Home</a></h4>
	<hr>
	<h5>Monitor a commissioned system</h5>
	<br>
	<i>Monitor your applications in commission. Look at metrics in real-time and historical,
	view application transactions, alerts and logs. View and control the  
	components of your system. </i> 
	<br>
	<br><br>
	<b>Notes:</b>This provides access into what is currently provided through the SMC Manage capability, Actional Management Server,
	 and beyond. Basic component state(view and control) is provided. 
	 Metrics and notifications should be re-channeled through Actional Dashboard widgets which is integrated here. 
	 Basic policy for catching failed transactions(Faults, RMEs, deadMessage postings) are present out the box. 
	 Also out of the box, policy for "transaction visibility" of Sonic process transactions.  I do not view the SMC Configure as being
	 a high priority. Higher-level deployment modeling should eliminate use of the SMC to configure. The SMC is used, similar to regedit, as a last-resort course coal-face tool).  
	<br><br>
	D Kibble: &quot;With cloud and &quot;1000+&quot; VM estates on the cards, SMC is really not a 
	viable management and control tool. BA has built its own control and management framework to control;
    Start / stop / restart of components
    Clearing of cached data (container caches, broker storage etc)
    Traffic steering for recovery and deployment purposes tied to broker acceptors and Actional stabalisers
    Log file and error information management&quot;
	<br><br>
 Give us your <a href="http://jira.aurea.local/browse/ESB-7476" target="_blank">feedback</a> on the maintenance experience.
 Additional material. insights are welcome.		
</div>