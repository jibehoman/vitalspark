<div id="commissionFlow">
	<div class="span-7">
	<p class="notice">Select Test Model</p>
	<form id="testModel" action="${flowExecutionUrl}" method="POST">
		<h:outputLabel>Select Test Features: </h:outputLabel>
		<br/>
          <p>
              <input type="checkbox" name="testFeatures" value="ATS" />Subscribe To Aurea Test Service</br>
          </p>
 		<button id="cancel" type="submit" name="_eventId_cancel">Cancel</button>
		<button id="previous" type="submit" name="_eventId_previous">&lt;&lt; Previous</button>
		<button id="finish" type="submit" name="_eventId_finish">Finish &gt;&gt;</button>
		<script type="text/javascript">
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'finish',event:'onclick',formId:'testModel',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'previous',event:'onclick',formId:'testModel',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'cancel',event:'onclick',formId:'testModel',params:{fragments:"body"}}));
		</script>
	</form>
</div>
	<div class="span-6 last">
	<div style="margin-left: 1em;">
		<h6>Test Model</h6>
		<p>Large deployments whether in-cloud, on-premise, or mixed, require performance and system testing. Leverage the Aurea Test Service to facilitate automated on-ramp testing and simulation of externally accessed systems.<p>
				<br/>
		Aurea Test Service provides a comprehensive set of tools and capabilities for
		testing your application both for functional and for load-testing. <br/><br/>You may operate this 
		service yourself, or, sign up to the service on a <i>subscription basis</i>. 
		When you sign up on a subscription basis
		Aurea will perform testing for you and make performance recommendations for you.
		<br/><br/>
		Aurea Test Service uses unique technology which we call <i>light and dark</i>.
		Your live production environment stays up and running in the light whilst we benchmark
		against the dark system. When testing and re-tuning is complete, we will flip the switch
		to bring the dark system live.  
		<br/><br/>
		Further, Aurea Test Service allows you to reuse test artifacts from your continuous build and test environment. Sonic Workbench
		test scenarios may be re-run these in a fully integrated performance test environment. Aurea Test Service
		allows you to re-point consumed services from live to test service endpoints, or, to stub test services that
		can replay responses based on historical interaction patterns.
		 from test stub services. 
		<br><br><b>Notes</b>:
		<br>
		Nobody has talked about testing. Customers like BA are looking out for our help here(Stubomatic is their stub replay architecture that we
		should ask IP for). 
		The Sonic acquisition of Mindreef which we, Aurea, now own, has fallen off the
		map. Mindreef had some cool features - I really liked the compose-ability of scenarios for load
		test building. At one time, real Sonic integration(i.e. deal with JMS Topics(Mindreef is Queue only) and
		modelling with the ESB Endpoint concept) was considered but never happened. I fear that Mindreef is now
		passe(look at SmartBear Soap/UI). But with or without Mindreef, we need to make a story here. 
		<br><br>
		Obviously <i>light and dark</i> is challenging(i.e. switch the dark to light), but we should <i>aspire</i>
		to something like this.<br/><br/>
		For testing, there is an argument that we encourage the <i>subscription basis</i> rather than customer DIY basis.
		At ActiveHealth we lost control of the account because the customer pounded the system in a way that made
		no sense to his actual usage scenarios. We found ourselves in the back seat, constantly on the defensive trying to
		explain system performance characteristics of a load-test that made no sense.
		<br/><br/>
		We have to address an obvious question here. Why do I need capacity planning and load-testing,
		why cannot auto-scaling work for me? The question is valid and needs answering.
		Part of the answer may  be that firing up new machines
		is too coarse a form of performance problem mitigation, and that system bottlenecks rarely occur 
		at this level of coarseness. The answer may also lay in the nature of a truly globally distributed
		application(we are not a WebServer that just horizontally scales). What ever answer we come up 
		with we should not be caught bad-mouthing 
		cloud vendors and auto-scaling in general, nor should we discount the possibility that some parts
		of our system are candidates for auto-scaling techniques.
		<br/> <br/>
What do you think? What do your customers ask about testing? <a href="http://jira.aurea.local/browse/ESB-7482" target="_blank">feedback</a> 		
	</div>
		</div>