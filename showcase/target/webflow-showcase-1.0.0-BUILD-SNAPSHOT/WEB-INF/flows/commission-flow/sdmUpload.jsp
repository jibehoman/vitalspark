<div id="commissionFlow" xmlns:h="http://java.sun.com/jsf/html">
	<div class="span-7">
	<p class="notice">Upload application archive</p>
	<form id="sdmUpload" action="${flowExecutionUrl}" method="POST"  enctype="multipart/form-data">
	   <div>
       <div class="span-4">	
		 <h:outputLabel>Select SDM Model: </h:outputLabel>
       </div>
       <div class="span-7 last">
	    <input type="file" name="sdm" value=${misc.sdm} }/>
       </div>
       </div>
		<button id="previous" type="submit" name="_eventId_previous">Previous &lt;&lt;</button>
		<button id="next" type="submit" name="_eventId_next">Next &gt;&gt;</button>
		<button id="cancel" type="submit" name="_eventId_cancel">Cancel</button>
		<script type="text/javascript">
		    Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'previous',event:'onclick',formId:'sdmUpload',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'next',event:'onclick',formId:'sdmUpload',params:{fragments:"body"}}));
			Spring.addDecoration(new Spring.AjaxEventDecoration({elementId:'cancel',event:'onclick',formId:'sdmUpload',params:{fragments:"body"}}));
		</script>
	</form>
</div>
</div>