<div id="commissionFlow" xmlns:h="http://java.sun.com/jsf/html">
	<div class="span-7">
	<p class="notice">Enter Domain Connection Information</p>
	<form id="developmentDomain" action="${flowExecutionUrl}" method="POST">
	   <div>
       <div class="span-4">	
		 <h:outputLabel>Domain Name: </h:outputLabel>
       </div>
       <div class="span-7 last">
		 <input name="domainName" value="${commission.domainName}">
       </div>
       </div>
	   <div>
       <div class="span-4">
		  <h:outputLabel>User: </h:outputLabel>
       </div>
       <div class="span-7 last">
		<input name="userName" value="${commission.userName}">
       </div>
       </div>
	   <div>
       <div class="span-4">
		 <h:outputLabel>Password: </h:outputLabel>
       </div>
       <div class="span-7 last">
		 <input name="password" value="${commission.password}">
        </div>
       </div>
	   <div>
       <div class="span-4">
		<h:outputLabel>Url: </h:outputLabel>
       </div>
       <div class="span-7 last">
		<input name="url" value="${commission.url}">
        </div>
       </div>
		<button id="previous" type="submit" name="_eventId_previous">Previous &lt;&lt;</button>
		<button id="next" type="submit" name="_eventId_next">Next &gt;&gt;</button>
		<button id="cancel" type="submit" name="_eventId_cancel">Cancel</button>
		<script type="text/javascript">
		    Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'previous',event:'onclick',formId:'developmentDomain',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'next',event:'onclick',formId:'developmentDomain',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'cancel',event:'onclick',formId:'developmentDomain',params:{fragments:"body"}}));
		</script>
	</form>
	</div>
	<div class="span-6 last">
	<div style="margin-left: 1em;">
		<h6>Development Domain</h6>
		<p>Connect to a running development environment and pick the processes to provision.<p>
	</div>
	</div>
</div>