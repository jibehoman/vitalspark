<div id="servicesFlow" xmlns:h="http://java.sun.com/jsf/html">
	<div class="span-7">
	<p class="notice">Enter Domain Connection Information</p>
	<form id="productionDomain" action="${flowExecutionUrl}" method="POST">
	   <div>
       <div class="span-4">	
		 <h:outputLabel>Domain Name: </h:outputLabel>
       </div>
       <div class="span-7 last">
		 <input name="domainName" value="${services.domainName}">
       </div>
       </div>
	   <div>
       <div class="span-4">
		  <h:outputLabel>User: </h:outputLabel>
       </div>
       <div class="span-7 last">
		<input name="userName" value="${services.userName}">
       </div>
       </div>
	   <div>
       <div class="span-4">
		 <h:outputLabel>Password: </h:outputLabel>
       </div>
       <div class="span-7 last">
		 <input name="password" value="${services.password}">
        </div>
       </div>
	   <div>
       <div class="span-4">
		<h:outputLabel>Url: </h:outputLabel>
       </div>
       <div class="span-7 last">
		<input name="url" value="${services.url}">
        </div>
       </div>
		<button id="previous" type="submit" name="_eventId_previous">Previous &lt;&lt;</button>
		<button id="next" type="submit" name="_eventId_next">Next &gt;&gt;</button>
		<button id="cancel" type="submit" name="_eventId_cancel">Cancel</button>
		<script type="text/javascript">
		    Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'previous',event:'onclick',formId:'productionDomain',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'next',event:'onclick',formId:'productionDomain',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'cancel',event:'onclick',formId:'productionDomain',params:{fragments:"body"}}));
		</script>
	</form>
	</div>
	<div class="span-6 last">
	<div style="margin-left: 1em;">
		<h6>Commissioned Domain</h6>
		<p>Enter connection details of the Sonic Domain to add new services to.
		<br><br><b>Note:</b><i>There is a <font color="Red">tension</font> here between development and production.
		Most services require incorporation into itineraries to realize their use.
		Although there may be stand-alone processes or services that are an exception to this,
		you need to go back to Workbench to fully integrate these services. That suggests an
		argument for Workbench directly supporting service repository features. 
		<br/><br/>On the flip-side, DXSI service integration currently supports
		the concept this workflow presents: you may import a DXSI service archive(.xar) into
		your development, or stage environment and there-after integrate the DXSI service 
		operations into an itinerary. What is nice here is that there is a clear
		separation of concerns. Deployment of services, configuration of their instances is an advanced task
		that this work-flow supports. DXSI exchange modeling is an extremely advanced developer task,
		so availability of pre-canned DXSI services in a repository represents
		a highly value-able asset. For this reason, making a restriction that Workbench be the only means for
		integrating repository services may not be the way to go. That approach makes sense where you want to work on the 
		<b>service</b> itself. 
		<br/><br/>The role of selecting and loading of services from a repository does feel different to
		that of an itinerary developer who incorporates the services into his/his applications. The place where
		the  service
		is loaded is unlikely to a production domain rather a pre-staging integration environment. This area
		needs further thought.
		<br/><br/>There could be another take-way here and it is more about the nature
		of services. 
		People integrating Sonic Connect and DXSI currently experience an extremely easy
		task. That is, DXSI and Sonic Connect services present to the itinerary author
		a clear set of operations, and typed input, output and fault parameters to map to and from the pipeline.
		We call these services <b>typed integration services</b>.
		Other ESB services(<b>pipeline services</b>) are not so transparent as they deal directly with the pipeline through a
		inbox, outbox, faultbox paradigm. This is kind of akin to a Unix process pipe model. What the services
		do in terms of consuming and embellishing the pipe-lining message is not obvious. I suspect that
		typed integration services available in a repository to have much higher value. <i>If that is the conclusion,</b> there
		is work to do to make generic typed integration service support. Also we would want to port some of the more value-able field services to
		use this model. Whilst that sounds significant, once done the service is in the repository.
		<br><br>
		<a href="http://jira.aurea.local/browse/ESB-7483" target="_blank">feedback</a>
		</i></p>
	</div>
	</div>
</div>