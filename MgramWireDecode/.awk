BEGIN {
file="drop";
}
/^Frame/{file=sprintf("%s%03d", "trace", ++i);next}
/^/{sub("^.","0000&"); sub("   ",": ");print >> file; next}
