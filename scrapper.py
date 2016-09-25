import sys
from bs4 import BeautifulSoup
import urllib2

def match_class(target):
        def do_match(tag):
            classes = tag.get('class', [])
            return all(c in classes for c in target)
        return do_match

def get_html(url):
	return BeautifulSoup(urllib2.urlopen(url), "html.parser")

base_url = sys.argv[1]

html = get_html(base_url)

try:
	title = (html.findAll(match_class(["q-title"]))[0]).string

	try: 
		yes_subj, no_subj = title.split('or')
	except:
		yes_subj, no_subj = title.split('vs')


	yes = (html.findAll(match_class(["yes-text"]))[0]).string.replace("Say Yes", "for "+yes_subj).rstrip()
	no = (html.findAll(match_class(["no-text"]))[0]).string.replace("Say No", "for"+no_subj).rstrip()

	print yes+" and "+no
except:
	title =  (html.findAll(match_class(["top"]))[0]).string

	try: 
		pro_subj, con_subj = title.split('or')
	except:
		pro_subj, con_subj = title.split('vs')

	pro = (html.findAll(match_class(["pointsStatus"]))[0]).string
	con = (html.findAll(match_class(["pointsStatus"]))[1]).string

	if pro == "Winning":
		print "I am in favor of "+pro_subj
	elif con == "Winning":
		print "I am in favor of "+con_subj
	else:
		print "I do not have an opinion of either one."

