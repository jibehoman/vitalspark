<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<div>
	<h2 class="alt">Maintenance Management</h2>
	<h4 class="alt"><a href="<c:url value="/"/>">Home</a></h4>
	<hr>
	<h5>Perform zero-downtime maintenance to your commissioned system.</h5>
	<br>
	<i>Browse the Aurea Asset Repository for latest patches. We will also make
	recommendations based on your current environment as to what patches are relevant
	to your system. Aurea's unique technology for high availability(fault-tolerant brokers,
	redundant or fault-tolerant application containers) allows us to apply patches with zero downtime.
	We'll recognize your environment redundancy setup and schedule restarts of patches 
	automatically for you to ensure full 24x7 continuity.</i> 
	<br><br>
	<b>Notes:</b><br>
	As it stands today, our patches are entirely incremental so to those in the know this comes off as spin. Still,
	it is not an entirely unrealistic message. When we start embracing the separation of the concerns: application development
	vs service development; those concerns are free to take on independent development and patch life-cycles.
	As an example, we know that Disney uses Sonic Connect REST, we can tell them pro-actively to get the latest patch ASAP
	because otherwise due a CXF issue their memory is going to leak away.
	This helps in another area of concern that our customers have stated. British Airways complain that we never effectively communicate
	on issues and patches that are relevant to them. It is not that we deliberately withhold information from the customer.
	We try our hardest. It is just that our engineering to field to customer communication lines don't always work
	the way they should.
	<br><br>
	I believe that patches are one of the asset types that should go in the repository. There are
	some compelling use cases for this. 
Live patch of a system requires us to connect to that 
	system. When connected we have intimate knowledge of the customer and
	his application. We can hone the patch list down to that which is relevant to
	the customer's system. We can go further: <i>the ability to see impact analysis
	against the customer's actual system becomes possible.</i> Take this further:<i>
	we may be able to suggest changes to accommodate the impact</i>.
	Finally: we can <i>apply the changes</i>, and we can <i>restart the live system 
	with promise of full 24x7 availability</i>. I suggest that when you can do all of the above,
	you are giving the customer a quite extraordinary experience. In terms of where the
	customer is with us, he/she becomes a loyal promoter. In business terms,
	 our Net Promoter Score(NPS) goes up big time.
	 
	
	
	
	
		<br><br>
 Give us your <a href="http://jira.aurea.local/browse/ESB-7476" target="_blank">feedback</a> on the maintenance experience.
 Additional material. insights are welcome.		
</div>