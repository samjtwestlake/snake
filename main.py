from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from lxml import html
from lxml.etree import ParserError
from lxml.html import builder

import pyperclip
from time import sleep
import json
import pickle

head = " "

options = webdriver.ChromeOptions()
options.add_argument("--allow-file-access-from-files")
driver = webdriver.Chrome('./chromedriver', options=options)
driver.get('https://challenge-teal.vercel.app/challenge')
jsScript = '''
            var s = window.document.createElement('script')
            s.src='file:///Users/samwestlake/Documents/snake/js/changeDirection.js'
            window.document.body.appendChild(s)
            '''
driver.execute_script(jsScript)

with open('js/changeDirectionScript.js', 'r') as f:
    text = f.read()
pyperclip.copy(text)

textarea = WebDriverWait(driver, 10).until(
    EC.visibility_of_element_located((By.CSS_SELECTOR, "div.jsx-180379588 textarea"))
)



textarea.click()
textarea.send_keys(Keys.COMMAND + "a")
textarea.send_keys(Keys.BACK_SPACE)
textarea.send_keys(Keys.COMMAND + "v")
runButt = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.XPATH, "//button[@class='jsx-180379588' and text()='Run']"))
)
runButt.click()

try:
    infos = []
    while True:
        infoRead = textarea.get_attribute('data-info-read')
        if infoRead == 'false':
            infoStr = textarea.get_attribute('data-info')
            jsScript = '''
            let textarea = document.getElementsByTagName('textarea')[0]
            textarea.dataset.infoRead = {0}
            '''.format("'true'")
            driver.execute_script(jsScript)
            info = json.loads(infoStr)
            infos.append(info)
except KeyboardInterrupt:
    pickle.dump(infos, open('infos.p', 'wb'))

