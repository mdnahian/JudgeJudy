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

def remove_adj(message):
	adj = ['better', 'worse', 'best', 'worst', 'than', '?']
	for a in adj:
		message = message.replace(a, "")
	return message

base_url = sys.argv[1]

html = get_html(base_url)

# opinion site
try:
	try:
		title = (html.findAll(match_class(["q-title"]))[0]).string

		try: 
			yes_subj, no_subj = title.split(' or ')
		except:
			yes_subj, no_subj = title.split(' vs ')


		yes = (html.findAll(match_class(["yes-text"]))[0]).string.replace("Say Yes", "for "+yes_subj).rstrip()
		no = (html.findAll(match_class(["no-text"]))[0]).string.replace("Say No", "for "+no_subj).rstrip()	
		
		print remove_adj(yes+" and "+no)
	# debate sites
	except:
		title =  (html.findAll(match_class(["top"]))[0]).string

		try: 
			pro_subj, con_subj = title.split(' or ')
		except:
			pro_subj, con_subj = title.split(' vs ')

		pro = (html.findAll(match_class(["pointsStatus"]))[0]).string
		con = (html.findAll(match_class(["pointsStatus"]))[1]).string
	
		summary = ''	
		win = (html.findAll(match_class(["pos0"]))[0]).string
		
		if pro == "Winning":
			try:
				if win == "Pro":
					summary = (html.findAll(match_class(["flipwordAlternateSpan"]))[0]).string
				else:
					summary = (html.findAll(match_class(["flipwordAlternateSpan"]))[1]).string
			except:	
				pass
			print remove_adj("I am in favor of "+pro_subj+" "+summary)
		elif con == "Winning":
			try:
				if win == "Con":
					summary = (html.findAll(match_class(["flipwordAlternateSpan"]))[0]).string
				else:
					summary = (html.findAll(match_class(["flipwordAlternateSpan"]))[1]).string
			except:
				pass
			print remove_adj("I am in favor of "+con_subj+" "+summary)
		else:
			print remove_adj("I do not have an opinion of either one.")
except:
	print "I do not have an opnion of either one."
