	
# Temporary records use redis to connect
module TemporaryRecord
	module ClassMethods

		def connection
			Rails.logger.debug "Connected to redis" unless Rails.nil?
			Redis.new :host => "127.0.0.1", :port => 6379
		end # connection

		def find key
			Rails.logger.debug "Attempting to find the record at: #{hash_key key}"
			string = connection.get(hash_key key)
			raise "Record Not Found Error: #{key}" if string.nil?
			hash = JSON.parse string
			deserialize hash
		end # find

		def deserialize hash
			throw "Implement Me!"
		end # deserialize

		def hash_key key 
			self.class.to_s + key.to_s
		end # generate_key
	end # class
	def self.included(base)
		base.extend ClassMethods
	end # included

	def persist
		self.class.connection.set self.class.hash_key(key), serialize.to_json
	end # save

	def persist!
		string = serialize.to_json
		throw "Bad serialization error" if string.nil?
		hkey = self.class.hash_key key
		throw "Bad hash key error" if hkey.nil?
		Rails.logger.debug "Saving to redis: #{hkey} => #{string}"
		throw "Unable to save error: #{hkey} => #{string}" unless self.class.connection.set hkey, string
		self
	end # persist!

	def key
		throw "Implement Me!"
	end # key

	def serialize
		throw "Implement Me!"
	end # serialize

	
end # TemporaryRecord