<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<div>
	<h2 class="alt">Services</h2>
	<h4 class="alt"><a href="<c:url value="/"/>">Home</a></h4>
	<div class="span-4 colborder">
		<h6>Add new services</h6>
		<br/>Aurea Experience Activator makes it easy to add new service
		capability to your existing 
		infrastructure. Capabilities are available in the Aurea Asset Repository. These capabilities include
		best-of-breed services written by Aurea field and service development experts. Customer built services are
		also supported. Assets can fall into a number of different categories including EAI adapters, on-ramps and off-ramps,
		interceptors(Sonic and Actional), custom services and processes, and industry standard data model intelligence
		components.
		</p>
	</div>
	<div class="span-14 colborder">
		<h3 class="alt">Add new Services</h3>
		<div id="servicesFlow">
			<a id="startFlow" href="services-flow">Add New Services Now</a>
			<script type="text/javascript">
				Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:"startFlow",event:"onclick",params:{fragments:"body",mode:"embedded"}}));
			</script>
		</div>
	</div>
	<div class="span-5">
		<h6>Medium Do List(prototyping)</h6>
		<ol compact>
		<li>Meta-data for "distillate" parameter concept is needed. Most generated parameterDeclarations.xml
		(whether Field Maven or DREM generated) entries are "good to go". In a large part this is because
		sonicfs:// references and other settings are highly portable. Distillate is a concept of a parameter that
		you might want to change in a Webflow UI like this(e.g. REST base URLs), or, that you want to appear in
		the Webflow UI for concept reinforcement purposes(some of the DS parameters are "re-confirmed").  
		<li>Distillates need UIs generated to enter parameters in a friendly fashion. Their appearance via
		parameterDeclarations.xml is always available through the UI - but we can do better like
		the Universal REST flow presents.</li>
		<li>We MUST define the nature of a service(artifact wise) in the repository. A .xar may be all that
		is needed. But the parameterDeclarations.xml generation magic needs to occur somewhere.</li>
		<li>Placement(Topology.xml), tuning DefaultTuning.xml, and Tuning.xml all need to be calculated
		properly. </li>
		<li>Feed from Field service-type Maven projects to this system required</li>
		</ol>
		<h6>Long Term Do List</h6>
		<ol compact>
		<li>Get a real repository e.g. Jack Rabbit because:</li>
		<li>Leverage the repository tagging system for ALL of these questions.
		<ul compact>
		 <li>Which business container do you go in?
		 <li>Which business section do you go in?(translation - DRA/SDM segment)?
		 <li>What constraints you under?
		<ul compact>
		 <li>Versions of course matter
		 <li>Dependencies matter
		 <li>You are only permitted to deploy this accounting procedure in Europe
		 <li>You are only allowed a singleton instance, maybe port issues e.g. a Web Service
		 <li>You are only allowed a 5 instances because that is all you are paid up for
		 <li>You are load-balance capable
		 <li>You are the <font color="Red"><b>new!</font></b> esbtraceroute interceptor that need to be ubiquitous(in all containers)
		 </ul>
		 </ul>
		 <li>We can simplify our process model. Because of the orthogonal repository tagging
		 we can remove some of the obscure settings("OnRamp" and "StrictMessageOrder") that don't
		 belong.
		 <li>Multiple repos requirement(customer's own repo) will come fast.
		</li>
		<li>Truly run updateDomain with restarts that respect 24x7 - we need to ensure any SDM bugs here are ironed
		 out - but I also think we need implicit in SDM a 24x7 smart SDM update where it is obvious that that
		 is what the configuration represents.</li>
		</ol>
		<h6>Takeaways</h6>
		<ol compact>
		<li>Non SOAP/REST EAI thru SonicConnect's Camel nature is a much closer reality</li>
		<li>We need talk to Adaptris on this and on "Typed Integration Service" service paradigm, i.e. what is the current Adaptris integration? If
		 it is JMS to EAI bridging, we might be able to do a lot better with the itinerary integration experience</li>
		</ol>
		</div>
	</div>